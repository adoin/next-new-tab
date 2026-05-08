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
  colSpan: 1,
  rowSpan: 1,
})

watch(() => props.visible, (v) => {
  if (v && props.editId) {
    const bm = bookmarks.bookmarks.find((b) => b.id === props.editId)
    if (bm) {
      form.value = { title: bm.title, description: bm.description, url: bm.url, icon: bm.icon, colSpan: bm.colSpan, rowSpan: bm.rowSpan }
    }
  } else if (v) {
    form.value = { title: '', description: '', url: '', icon: '', colSpan: 1, rowSpan: 1 }
  }
})

function onSave() {
  if (!form.value.url) return
  if (props.editId) {
    bookmarks.updateBookmark(props.editId, { ...form.value })
  } else {
    bookmarks.addBookmark({ ...form.value })
  }
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
