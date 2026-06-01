<script setup lang="ts">
import { computed } from 'vue'
import { useBookmarksStore, useSettingsStore } from '../stores'
import BookmarkCard from './BookmarkCard.vue'

const bookmarks = useBookmarksStore()
const settings = useSettingsStore()

const emit = defineEmits<{
  edit: [id: string]
  add: []
}>()

const safeBookmarks = computed(() =>
  Array.isArray(bookmarks.bookmarks) ? bookmarks.bookmarks : [],
)

const cardSize = computed(() => settings.settings.bookmarkCardSize || 100)

const GRID_GAP_X = 12
const GRID_GAP_Y = 16

function effectiveColSpan(bm: { colSpan?: number; contentJump?: boolean }) {
  const span = bm.colSpan || 1
  return bm.contentJump ? Math.max(2, span) : span
}

function onDelete(id: string) {
  bookmarks.removeBookmark(id)
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
      <BookmarkCard
        v-for="bm in safeBookmarks"
        :key="bm.id"
        :bookmark="bm"
        :scale="settings.settings.bookmarkScale"
        :radius="settings.settings.cardRadius"
        :card-size="cardSize"
        :card-padding="settings.settings.cardPadding"
        :style="{
          gridColumn: `span ${effectiveColSpan(bm)}`,
          gridRow: `span ${bm.rowSpan || 1}`,
        }"
        @edit="emit('edit', $event)"
        @delete="onDelete"
      />

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
