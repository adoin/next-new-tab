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
        gap: '16px 12px',
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
        @edit="emit('edit', $event)"
        @delete="onDelete"
      />

      <div class="flex flex-col items-center gap-1.5">
        <button
          class="glass flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden"
          :style="{
            width: `${cardSize}px`,
            height: `${cardSize}px`,
            padding: `${settings.settings.cardPadding}px`,
            borderRadius: `${settings.settings.cardRadius}px`,
          }"
          @click="emit('add')"
        >
          <span class="text-white/50 text-3xl">+</span>
        </button>
      </div>
    </div>
  </div>
</template>
