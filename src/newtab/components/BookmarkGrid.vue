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

function onDelete(id: string) {
  bookmarks.removeBookmark(id)
}
</script>

<template>
  <div
    class="w-full mx-auto"
    :style="{
      maxWidth: `${settings.settings.gridColumns * 140 * (settings.settings.bookmarkScale / 100)}px`,
      transform: `scale(${settings.settings.bookmarkScale / 100})`,
      transformOrigin: 'top center',
    }"
  >
    <div
      class="grid gap-3"
      :style="{
        gridTemplateColumns: `repeat(${settings.settings.gridColumns}, 1fr)`,
      }"
    >
      <BookmarkCard
        v-for="bm in safeBookmarks"
        :key="bm.id"
        :bookmark="bm"
        :scale="settings.settings.bookmarkScale"
        :radius="settings.settings.cardRadius"
        @edit="emit('edit', $event)"
        @delete="onDelete"
      />

      <button
        class="glass flex items-center justify-center aspect-square cursor-pointer hover:scale-105 transition-transform"
        :style="{ borderRadius: `${settings.settings.cardRadius}px` }"
        @click="emit('add')"
      >
        <span class="text-white/50 text-3xl">+</span>
      </button>
    </div>
  </div>
</template>
