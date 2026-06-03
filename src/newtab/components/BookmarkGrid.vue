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
const gridColumns = computed(() => settings.settings.gridColumns || 12)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridColumns.value}, minmax(0, 1fr))`,
}))

function effectiveColSpan(bm: { colSpan?: number; contentJump?: boolean }) {
  const span = bm.colSpan || 1
  return bm.contentJump ? Math.max(2, span) : span
}

function gridItemStyle(bm: { colSpan?: number; rowSpan?: number; contentJump?: boolean }) {
  return {
    gridColumn: `span ${Math.min(effectiveColSpan(bm), gridColumns.value)}`,
    gridRow: `span ${bm.rowSpan || 1}`,
  }
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
  <div class="w-full">
    <div class="bookmark-grid w-full grid" :style="gridStyle">
      <div
        v-for="bm in sortedBookmarks"
        :key="bm.id"
        class="bookmark-grid-item flex justify-center items-start min-w-0"
        :class="{
          'bookmark-grid-item--dragging': draggingId === bm.id,
          'bookmark-grid-item--drag-over': dragOverId === bm.id && draggingId !== bm.id,
        }"
        :style="gridItemStyle(bm)"
        draggable="true"
        @dragstart="onDragStart($event, bm.id)"
        @dragover="onDragOver($event, bm.id)"
        @dragleave="onDragLeave($event, bm.id)"
        @drop="onDrop($event, bm.id)"
        @dragend="onDragEnd"
      >
        <BookmarkCard
          :bookmark="bm"
          :col-span="effectiveColSpan(bm)"
          :radius="settings.settings.cardRadius"
          :card-size="cardSize"
          @edit="emit('edit', $event)"
          @delete="onDelete"
        />
      </div>

      <div
        class="bookmark-grid-item flex justify-center items-start min-w-0"
        :style="{ gridColumn: 'span 1', gridRow: 'span 1' }"
      >
        <BookmarkCard
          is-add
          :col-span="1"
          :radius="settings.settings.cardRadius"
          :card-size="cardSize"
          @add="emit('add')"
        />
      </div>
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
