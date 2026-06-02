<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBookmarksStore, useSettingsStore } from '../stores'
import BookmarkCard from './BookmarkCard.vue'

const bookmarks = useBookmarksStore()
const settings = useSettingsStore()

const emit = defineEmits<{
  edit: [id: string]
  add: []
}>()

const draggingId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)

const safeBookmarks = computed(() =>
  Array.isArray(bookmarks.bookmarks) ? bookmarks.bookmarks : [],
)

const sortedBookmarks = computed(() =>
  [...safeBookmarks.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
)

const cardSize = computed(() => settings.settings.bookmarkCardSize || 100)

const GRID_GAP_X = 12
const GRID_GAP_Y = 16

function effectiveColSpan(bm: { colSpan?: number; contentJump?: boolean }) {
  const span = bm.colSpan || 1
  return bm.contentJump ? Math.max(2, span) : span
}

function isInteractiveDragTarget(target: EventTarget | null) {
  return target instanceof Element
    && !!target.closest('input, button, textarea, a, [contenteditable="true"]')
}

function onDelete(id: string) {
  bookmarks.removeBookmark(id)
}

function onDragStart(e: DragEvent, id: string) {
  if (isInteractiveDragTarget(e.target)) {
    e.preventDefault()
    return
  }
  draggingId.value = id
  dragOverId.value = null
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
}

function onDragOver(e: DragEvent, targetId: string) {
  if (!draggingId.value || draggingId.value === targetId) return
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverId.value = targetId
}

function onDragLeave(e: DragEvent, targetId: string) {
  const related = e.relatedTarget
  if (related instanceof Node && (e.currentTarget as Node).contains(related)) return
  if (dragOverId.value === targetId) dragOverId.value = null
}

function reorderByIds(fromId: string, toId: string) {
  const list = [...sortedBookmarks.value]
  const fromIndex = list.findIndex((b) => b.id === fromId)
  const toIndex = list.findIndex((b) => b.id === toId)
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
  const [moved] = list.splice(fromIndex, 1)
  list.splice(toIndex, 0, moved)
  bookmarks.reorderBookmarks(list)
}

function onDrop(e: DragEvent, targetId: string) {
  e.preventDefault()
  const fromId = draggingId.value
  if (fromId) reorderByIds(fromId, targetId)
  draggingId.value = null
  dragOverId.value = null
}

function onDragEnd() {
  draggingId.value = null
  dragOverId.value = null
}
</script>

<template>
  <div
    class="w-full mx-auto"
    :style="{
      transform: `scale(${settings.settings.bookmarkScale / 100})`,
      transformOrigin: 'top center',
    }"
  >
    <div
      class="grid justify-items-center"
      :style="{
        gridTemplateColumns: `repeat(${settings.settings.gridColumns}, auto)`,
        gap: `${GRID_GAP_Y}px ${GRID_GAP_X}px`,
      }"
    >
      <div
        v-for="bm in sortedBookmarks"
        :key="bm.id"
        class="bookmark-grid-item"
        :class="{
          'bookmark-grid-item--dragging': draggingId === bm.id,
          'bookmark-grid-item--drag-over': dragOverId === bm.id && draggingId !== bm.id,
        }"
        draggable="true"
        :style="{
          gridColumn: `span ${effectiveColSpan(bm)}`,
          gridRow: `span ${bm.rowSpan || 1}`,
        }"
        @dragstart="onDragStart($event, bm.id)"
        @dragover="onDragOver($event, bm.id)"
        @dragleave="onDragLeave($event, bm.id)"
        @drop="onDrop($event, bm.id)"
        @dragend="onDragEnd"
      >
        <BookmarkCard
          :bookmark="bm"
          :scale="settings.settings.bookmarkScale"
          :radius="settings.settings.cardRadius"
          :card-size="cardSize"
          :card-padding="settings.settings.cardPadding"
          @edit="emit('edit', $event)"
          @delete="onDelete"
        />
      </div>

      <BookmarkCard
        is-add
        :scale="settings.settings.bookmarkScale"
        :radius="settings.settings.cardRadius"
        :card-size="cardSize"
        :card-padding="settings.settings.cardPadding"
        @add="emit('add')"
      />
    </div>
  </div>
</template>

<style scoped>
.bookmark-grid-item {
  cursor: grab;
  border-radius: 12px;
  transition: opacity 0.15s ease, box-shadow 0.15s ease;
}

.bookmark-grid-item:active {
  cursor: grabbing;
}

.bookmark-grid-item--dragging {
  opacity: 0.45;
}

.bookmark-grid-item--drag-over {
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.85);
}
</style>
