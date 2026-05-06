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
  window.location.href = props.bookmark.url
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
    <div
      v-if="bookmark.bgImage"
      class="absolute inset-0 bg-cover bg-center opacity-30"
      :style="{ backgroundImage: `url(${bookmark.bgImage})` }"
    />

    <div class="relative p-3 flex flex-col items-center justify-center h-full gap-1">
      <img
        v-if="bookmark.icon"
        :src="bookmark.icon"
        :alt="bookmark.title"
        class="w-10 h-10 rounded-lg object-contain"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div class="text-white font-medium text-sm text-center line-clamp-1">{{ bookmark.title }}</div>
      <div
        v-if="bookmark.description"
        class="text-white/50 text-xs text-center line-clamp-2"
      >
        {{ bookmark.description }}
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
