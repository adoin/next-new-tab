<script setup lang="ts">
import type { HistoryEvent } from '../types'

defineProps<{
  events: HistoryEvent[]
  loading: boolean
}>()

const domainLabels: Record<string, string> = {
  football: '⚽ 足球',
  basketball: '🏀 篮球',
  history: '📜 重大历史',
}
</script>

<template>
  <div class="glass p-4 mx-auto max-w-4xl">
    <div v-if="loading" class="text-white/70 text-center py-4">加载中...</div>
    <div v-else-if="events.length === 0" class="text-white/70 text-center py-4">暂无数据</div>
    <div v-else class="flex gap-4 overflow-x-auto pb-2">
      <div
        v-for="(event, i) in events"
        :key="i"
        class="glass-dark flex-shrink-0 w-64 p-3 cursor-pointer hover:scale-105 transition-transform"
      >
        <div class="text-yellow-300 text-sm font-bold mb-1">{{ event.year }}年</div>
        <div class="text-white font-medium mb-1 line-clamp-2">{{ event.title }}</div>
        <div class="text-white/60 text-xs line-clamp-3">{{ event.description }}</div>
      </div>
    </div>
  </div>
</template>
