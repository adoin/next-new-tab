<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Bookmark } from '../types'
import { useBookmarksStore } from '../stores'

const props = defineProps<{
  visible: boolean
  editId: string | null
}>()

const emit = defineEmits<{
  close: []
}>()

const bookmarks = useBookmarksStore()

const form = ref({
  title: '',
  description: '',
  url: '',
  icon: '',
  iconBgColor: 'transparent',
  colSpan: 1,
  rowSpan: 1,
})

const hexColor = ref('#000000')
const alpha = ref(0)
const useBgColor = ref(false)

function parseRgba(str: string) {
  if (!str || str === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }
  const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    }
  }
  return { r: 0, g: 0, b: 0, a: 0 }
}

function rgbaToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function hexToRgba(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 }
}

function updateFormColor() {
  if (!useBgColor.value) {
    form.value.iconBgColor = 'transparent'
  } else {
    const { r, g, b } = hexToRgba(hexColor.value)
    form.value.iconBgColor = `rgba(${r}, ${g}, ${b}, ${alpha.value})`
  }
}

watch([hexColor, alpha, useBgColor], updateFormColor)

watch(() => props.visible, (v) => {
  if (v && props.editId) {
    const list = Array.isArray(bookmarks.bookmarks) ? bookmarks.bookmarks : []
    const bm = list.find((b) => b.id === props.editId)
    if (bm) {
      form.value = {
        title: bm.title,
        description: bm.description,
        url: bm.url,
        icon: bm.icon,
        iconBgColor: bm.iconBgColor || 'transparent',
        colSpan: bm.colSpan,
        rowSpan: bm.rowSpan,
      }
      const parsed = parseRgba(bm.iconBgColor)
      useBgColor.value = parsed.a > 0
      hexColor.value = rgbaToHex(parsed.r, parsed.g, parsed.b)
      alpha.value = parsed.a
    }
  } else if (v) {
    form.value = { title: '', description: '', url: '', icon: '', iconBgColor: 'transparent', colSpan: 1, rowSpan: 1 }
    hexColor.value = '#000000'
    alpha.value = 0
    useBgColor.value = false
  }
})

function onSave() {
  if (!form.value.url) return
  if (props.editId) {
    bookmarks.updateBookmark(props.editId, { ...form.value })
  } else {
    bookmarks.addBookmark({ ...form.value })
  }
  bookmarks.flush()
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="glass w-full max-w-md p-6 space-y-4">
        <h2 class="text-white text-lg font-bold">{{ editId ? '编辑书签' : '添加书签' }}</h2>

        <div class="space-y-3">
          <div>
            <label class="text-white/70 text-sm block mb-1">标题</label>
            <input v-model="form.title" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none" placeholder="Google" />
          </div>
          <div>
            <label class="text-white/70 text-sm block mb-1">URL *</label>
            <input v-model="form.url" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none" placeholder="https://google.com" />
          </div>
          <div>
            <label class="text-white/70 text-sm block mb-1">描述</label>
            <input v-model="form.description" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none" placeholder="搜索引擎" />
          </div>
          <div>
            <label class="text-white/70 text-sm block mb-1">图标 URL</label>
            <input v-model="form.icon" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none" placeholder="留空自动获取 favicon" />
          </div>
          <div>
            <div class="flex items-center gap-2 mb-2">
              <label class="text-white/70 text-sm">图标背景色</label>
              <label class="flex items-center gap-1.5 text-white/50 text-xs cursor-pointer">
                <input type="checkbox" v-model="useBgColor" class="accent-blue-400" />
                <span>启用</span>
              </label>
            </div>
            <div v-if="useBgColor" class="space-y-2 pl-1">
              <div class="flex items-center gap-3">
                <input
                  v-model="hexColor"
                  type="color"
                  class="w-10 h-10 rounded cursor-pointer bg-transparent"
                />
                <div class="flex-1">
                  <label class="text-white/50 text-xs block mb-1">透明度 {{ Math.round(alpha * 100) }}%</label>
                  <input v-model.number="alpha" type="range" min="0" max="1" step="0.01" class="w-full accent-blue-400" />
                </div>
              </div>
              <div class="text-white/40 text-xs">预览: {{ form.iconBgColor }}</div>
            </div>
          </div>
          <div class="flex gap-4">
            <div>
              <label class="text-white/70 text-sm block mb-1">占列数</label>
              <input v-model.number="form.colSpan" type="number" min="1" max="4" class="w-20 bg-white/10 rounded-lg px-3 py-2 text-white outline-none" />
            </div>
            <div>
              <label class="text-white/70 text-sm block mb-1">占行数</label>
              <input v-model.number="form.rowSpan" type="number" min="1" max="4" class="w-20 bg-white/10 rounded-lg px-3 py-2 text-white outline-none" />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button class="px-4 py-2 rounded-lg text-white/70 hover:bg-white/10 transition-colors" @click="emit('close')">取消</button>
          <button class="px-4 py-2 rounded-lg bg-blue-500/80 text-white hover:bg-blue-500 transition-colors" @click="onSave">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
