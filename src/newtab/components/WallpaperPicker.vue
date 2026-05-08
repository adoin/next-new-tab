<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Wallpaper360Category, Wallpaper360Item } from '../types'

const props = defineProps<{
  visible: boolean
  categories: Wallpaper360Category[]
  wallpapers: Wallpaper360Item[]
  loading: boolean
  activeCategoryId: string
  page: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{
  close: []
  selectCategory: [id: string]
  selectWallpaper: [item: Wallpaper360Item]
  goPage: [page: number]
}>()

// Track load state per image: 'pending' | 'thumb' | 'full' | 'error'
const loadState = ref<Record<string, string>>({})

function getItemKey(item: Wallpaper360Item): string {
  return item.pid || item.id || ''
}

function getThumbUrl(item: Wallpaper360Item): string {
  return item.url_thumb || item.url_mid || ''
}

function getFullUrl(item: Wallpaper360Item): string {
  return item.url || item.url_mobile || item.url_mid || item.url_thumb || ''
}

function onThumbLoad(item: Wallpaper360Item) {
  const key = getItemKey(item)
  if (loadState.value[key] !== 'full') {
    loadState.value[key] = 'thumb'
  }
}

function onFullLoad(item: Wallpaper360Item) {
  loadState.value[getItemKey(item)] = 'full'
}

function onFullError(item: Wallpaper360Item) {
  const key = getItemKey(item)
  if (loadState.value[key] !== 'thumb') {
    loadState.value[key] = 'error'
  }
}

// Reset load state when wallpapers list changes
watch(() => props.wallpapers, () => {
  loadState.value = {}
}, { flush: 'sync' })

function onSelect(item: Wallpaper360Item) {
  emit('selectWallpaper', item)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="picker">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-8">
        <!-- backdrop -->
        <div class="absolute inset-0 bg-black/70" @click="emit('close')" />

        <!-- panel -->
        <div class="relative glass w-full max-w-6xl h-[85vh] rounded-2xl overflow-hidden flex flex-col">
          <!-- header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 class="text-white text-lg font-bold">选择壁纸</h2>
            <button class="text-white/50 hover:text-white text-xl w-8 h-8 flex items-center justify-center" @click="emit('close')">&#x2715;</button>
          </div>

          <!-- category tabs -->
          <div class="px-6 py-2 border-b border-white/10">
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="cat in categories"
                :key="cat.id"
                class="px-2 py-1 rounded-full text-xs whitespace-nowrap transition-colors"
                :class="activeCategoryId === cat.id
                  ? 'bg-blue-500/80 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'"
                @click="emit('selectCategory', cat.id)"
              >
                {{ cat.name }}
              </button>
            </div>
          </div>

          <!-- content -->
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <div v-if="loading" class="flex items-center justify-center h-full">
              <span class="text-white/40 text-sm">加载中...</span>
            </div>
            <div v-else-if="wallpapers.length === 0" class="flex items-center justify-center h-full">
              <span class="text-white/40 text-sm">暂无壁纸</span>
            </div>
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <div
                v-for="item in wallpapers"
                :key="getItemKey(item)"
                class="relative aspect-video rounded-lg overflow-hidden cursor-pointer group bg-white/5"
                @click="onSelect(item)"
              >
                <!-- placeholder shimmer -->
                <div
                  v-if="loadState[getItemKey(item)] !== 'full'"
                  class="absolute inset-0 bg-white/5 animate-pulse"
                />
                <!-- thumb: loads fast, shows immediately -->
                <img
                  v-if="getThumbUrl(item)"
                  :src="getThumbUrl(item)"
                  class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  :class="loadState[getItemKey(item)] === 'thumb' ? 'opacity-100' : 'opacity-0'"
                  loading="lazy"
                  @load="onThumbLoad(item)"
                />
                <!-- full res: loads on top, fades in when ready -->
                <img
                  :src="getFullUrl(item)"
                  class="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  :class="loadState[getItemKey(item)] === 'full' ? 'opacity-100' : 'opacity-0'"
                  loading="lazy"
                  @load="onFullLoad(item)"
                  @error="onFullError(item)"
                />
                <!-- hover overlay -->
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span class="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">设为壁纸</span>
                </div>
              </div>
            </div>
          </div>

          <!-- pagination -->
          <div v-if="total > pageSize" class="px-6 py-3 border-t border-white/10 flex items-center justify-center gap-2">
            <button
              class="px-3 py-1 rounded-lg text-sm transition-colors"
              :class="page > 1 ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/30 cursor-not-allowed'"
              :disabled="page <= 1"
              @click="emit('goPage', page - 1)"
            >
              上一页
            </button>
            <span class="text-white/50 text-sm px-2">{{ page }} / {{ Math.ceil(total / pageSize) }}</span>
            <button
              class="px-3 py-1 rounded-lg text-sm transition-colors"
              :class="page < Math.ceil(total / pageSize) ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/30 cursor-not-allowed'"
              :disabled="page >= Math.ceil(total / pageSize)"
              @click="emit('goPage', page + 1)"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.picker-enter-active,
.picker-leave-active {
  transition: opacity 0.2s ease;
}
.picker-enter-from,
.picker-leave-to {
  opacity: 0;
}
</style>
