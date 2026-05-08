<script setup lang="ts">
import type { Bookmark } from '../types'

const props = defineProps<{
  bookmark: Bookmark
  scale: number
  radius: number
}>()

const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

function open() {
  let url = props.bookmark.url.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  window.open(url, '_blank')
}
</script>

<template>
  <div
    class="glass group relative cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl overflow-hidden"
    :style="{
      gridColumn: `span ${bookmark.colSpan}`,
      gridRow: `span ${bookmark.rowSpan}`,
      borderRadius: `${radius}px`,
    }"
    @click="open"
  >
    <div class="relative flex flex-col items-center justify-center h-full w-full">
      <img
        v-if="bookmark.icon"
        :src="bookmark.icon"
        :alt="bookmark.title"
        class="w-full h-full object-cover"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
        <div class="text-white font-medium text-xs text-center line-clamp-1">{{ bookmark.title }}</div>
      </div>
    </div>

    <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        class="w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white text-xs hover:bg-black/60"
        @click.stop="emit('edit', bookmark.id)"
      >
        ✎
      </button>
      <button
        class="w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white text-xs hover:bg-red-500/60"
        @click.stop="emit('delete', bookmark.id)"
      >
        ✕
      </button>
    </div>
  </div>
</template>
