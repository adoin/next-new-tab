<script setup lang="ts">
import { ref } from 'vue'
import { getColorSync } from 'colorthief'
import type { Bookmark } from '../types'
import { useSettingsStore } from '../stores'

const props = defineProps<{
  bookmark: Bookmark
  scale: number
  radius: number
  cardSize: number
  cardPadding: number
}>()

const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

const settings = useSettingsStore()
const textColor = ref('white')

function getLuminance(r: number, g: number, b: number) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function onImageLoad(e: Event) {
  const img = e.target as HTMLImageElement
  try {
    const color = getColorSync(img)
    if (color) {
      const rgb = color.rgb()
      const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
      textColor.value = luminance > 0.5 ? '#1a1a1a' : 'white'
    }
  } catch {
    // CORS or other error, keep default white
  }
}

function open() {
  let url = props.bookmark.url.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  if (settings.settings.bookmarkOpenMode === 'currentTab') {
    window.location.href = url
  } else {
    window.open(url, '_blank')
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-1.5 group relative">
    <div
      class="glass cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl overflow-hidden flex items-center justify-center"
      :style="{
        width: `${cardSize}px`,
        height: `${cardSize}px`,
        padding: `${cardPadding}px`,
        borderRadius: `${radius}px`,
        backgroundColor: bookmark.iconBgColor || 'transparent',
      }"
      @click="open"
    >
      <img
        v-if="bookmark.icon"
        :src="bookmark.icon"
        :alt="bookmark.title"
        class="w-[70%] h-[70%] object-contain"
        crossorigin="anonymous"
        @load="onImageLoad"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
    </div>
    <div class="w-[90%] text-center">
      <div
        class="font-medium text-sm truncate"
        :style="{
          color: textColor,
          textShadow: textColor === 'white' ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(255,255,255,0.5)',
        }"
      >{{ bookmark.title }}</div>
    </div>

    <div class="absolute top-0.5 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
