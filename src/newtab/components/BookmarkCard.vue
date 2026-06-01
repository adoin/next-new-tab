<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useSettingsStore } from '../stores'
import {
  getContentJumpHistory,
  pushContentJumpHistory,
} from '../composables/useContentJumpHistory'
import BookmarkJumpHistoryItem from './BookmarkJumpHistoryItem.vue'
import type { Bookmark } from '../types'

const GRID_GAP_X = 12
const GRID_GAP_Y = 16

const props = defineProps<{
  bookmark?: Bookmark
  isAdd?: boolean
  scale: number
  radius: number
  cardSize: number
  cardPadding: number
}>()

const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
  add: []
}>()

const settings = useSettingsStore()
const jumpInput = ref('')
const jumpHistory = ref<string[]>([])

const iconSizePercent = computed(() => settings.settings.bookmarkIconSize ?? 90)
const rainbowTitles = computed(() => settings.settings.rainbowTitles === true)
const contentJumpEnabled = computed(() => !props.isAdd && props.bookmark?.contentJump === true)
const imageRadius = computed(() => `${props.radius}px`)

const colSpan = computed(() => {
  if (props.isAdd) return 1
  const span = props.bookmark!.colSpan || 1
  return contentJumpEnabled.value ? Math.max(2, span) : span
})
const rowSpan = computed(() => (props.isAdd ? 1 : props.bookmark!.rowSpan || 1))

const displayWidth = computed(() =>
  colSpan.value * props.cardSize + (colSpan.value - 1) * GRID_GAP_X,
)
const displayHeight = computed(() =>
  rowSpan.value * props.cardSize + (rowSpan.value - 1) * GRID_GAP_Y,
)

function refreshJumpHistory() {
  if (props.bookmark?.id) {
    jumpHistory.value = getContentJumpHistory(props.bookmark.id)
  } else {
    jumpHistory.value = []
  }
}

onMounted(refreshJumpHistory)
watch(() => props.bookmark?.id, refreshJumpHistory)

function normalizeUrl(url: string) {
  let normalized = url.trim()
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`
  }
  return normalized
}

function navigateTo(url: string) {
  if (settings.settings.bookmarkOpenMode === 'currentTab') {
    window.location.href = url
  } else {
    window.open(url, '_blank')
  }
}

function buildJumpUrl(content: string) {
  return normalizeUrl(props.bookmark!.url).replace(/%s/g, encodeURIComponent(content.trim()))
}

function open() {
  if (props.isAdd) {
    emit('add')
    return
  }
  if (contentJumpEnabled.value) return
  navigateTo(normalizeUrl(props.bookmark!.url))
}

function jumpWithContent(content: string) {
  const trimmed = content.trim()
  if (!trimmed || !props.bookmark) return
  navigateTo(buildJumpUrl(trimmed))
  jumpHistory.value = pushContentJumpHistory(props.bookmark.id, trimmed)
}

function openWithContent() {
  const content = jumpInput.value.trim()
  if (!content) return
  jumpWithContent(content)
  jumpInput.value = ''
}

function onJumpKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    openWithContent()
  }
}
</script>

<template>
  <div
    class="flex flex-col items-center gap-1.5 group relative"
    :style="{ width: `${displayWidth}px` }"
  >
    <div
      class="glass transition-all duration-200 hover:shadow-xl overflow-hidden flex flex-col box-border"
      :class="[
        contentJumpEnabled ? 'gap-1.5' : 'cursor-pointer hover:scale-105',
        isAdd ? '' : 'w-full',
      ]"
      :style="{
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        padding: `${cardPadding}px`,
        borderRadius: `${radius}px`,
        backgroundColor: isAdd ? 'transparent' : (bookmark!.iconBgColor || 'transparent'),
      }"
      @click="open"
    >
      <!-- 携带内容跳转：左 logo + 右历史参数 -->
      <div
        v-if="contentJumpEnabled"
        class="flex flex-1 min-h-0 w-full gap-2"
      >
        <div class="bookmark-jump-logo shrink-0 flex items-center justify-center">
          <img
            v-if="bookmark!.icon"
            :src="bookmark!.icon"
            :alt="bookmark!.title"
            class="bookmark-jump-logo__img object-contain w-full h-full"
            :style="{ borderRadius: imageRadius }"
            crossorigin="anonymous"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
        </div>
        <ul
          class="bookmark-jump-history flex-1 min-w-0 min-h-0 overflow-y-auto list-none m-0 p-0 flex flex-col gap-0.5"
          @click.stop
        >
          <li v-if="jumpHistory.length === 0" class="bookmark-title-readable text-[10px] py-0.5">
            暂无记录
          </li>
          <li v-for="item in jumpHistory" :key="item">
            <BookmarkJumpHistoryItem :text="item" @select="jumpWithContent(item)" />
          </li>
        </ul>
      </div>

      <!-- 普通书签 / 添加 -->
      <div
        v-else
        class="flex flex-1 min-h-0 w-full items-center justify-center h-full"
      >
        <svg
          v-if="isAdd"
          class="text-white/50 aspect-square max-w-full max-h-full"
          :style="{
            width: `${iconSizePercent}%`,
            height: `${iconSizePercent}%`,
            borderRadius: imageRadius,
          }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        <img
          v-else-if="bookmark!.icon"
          :src="bookmark!.icon"
          :alt="bookmark!.title"
          class="object-contain aspect-square max-w-full max-h-full"
          :style="{
            width: `${iconSizePercent}%`,
            height: `${iconSizePercent}%`,
            borderRadius: imageRadius,
          }"
          crossorigin="anonymous"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
      </div>

      <input
        v-if="contentJumpEnabled"
        v-model="jumpInput"
        type="text"
        class="bookmark-title-readable w-full shrink-0 px-2 py-1.5 text-sm leading-snug rounded-md bg-white/15 outline-none border border-white/20 focus:border-blue-400/70"
        placeholder="输入后回车跳转"
        @click.stop
        @keydown="onJumpKeydown"
      />
    </div>

    <div class="w-[90%] text-center">
      <div
        class="font-medium truncate"
        :class="[
          contentJumpEnabled ? 'text-base' : 'text-sm',
          rainbowTitles ? 'bookmark-title-rainbow' : 'bookmark-title-readable',
          isAdd && !rainbowTitles ? 'opacity-70' : '',
        ]"
      >{{ isAdd ? '添加书签' : bookmark!.title }}</div>
    </div>

    <div v-if="!isAdd" class="absolute top-0.5 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        class="w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white text-xs hover:bg-black/60"
        @click.stop="emit('edit', bookmark!.id)"
      >
        ✎
      </button>
      <button
        class="w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white text-xs hover:bg-red-500/60"
        @click.stop="emit('delete', bookmark!.id)"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<style scoped>
.bookmark-jump-logo {
  width: 38%;
  max-width: 72px;
  min-width: 40px;
}

.bookmark-jump-history {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.35) transparent;
}

.bookmark-jump-history::-webkit-scrollbar {
  width: 4px;
}

.bookmark-jump-history::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.35);
}
</style>
