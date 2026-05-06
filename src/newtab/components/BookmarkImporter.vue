<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBookmarks } from '../composables/useBookmarks'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { getChromeBookmarks, importFromChrome } = useBookmarks()
const chromeBookmarks = ref<Array<{ title: string; url: string; id: string }>>([])
const selected = ref<Set<string>>(new Set())

onMounted(async () => {
  chromeBookmarks.value = await getChromeBookmarks()
})

function toggle(id: string) {
  if (selected.value.has(id)) {
    selected.value.delete(id)
  } else {
    selected.value.add(id)
  }
}

function onImport() {
  const toImport = chromeBookmarks.value.filter((b) => selected.value.has(b.id))
  importFromChrome(toImport)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="glass w-full max-w-lg max-h-[70vh] p-6 flex flex-col">
        <h2 class="text-white text-lg font-bold mb-4">从浏览器书签导入</h2>

        <div class="flex-1 overflow-y-auto space-y-2 mb-4">
          <div
            v-for="bm in chromeBookmarks"
            :key="bm.id"
            class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
            :class="{ 'bg-white/15': selected.has(bm.id) }"
            @click="toggle(bm.id)"
          >
            <input type="checkbox" :checked="selected.has(bm.id)" class="accent-blue-400" />
            <div class="flex-1 min-w-0">
              <div class="text-white text-sm truncate">{{ bm.title }}</div>
              <div class="text-white/40 text-xs truncate">{{ bm.url }}</div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button class="px-4 py-2 rounded-lg text-white/70 hover:bg-white/10" @click="emit('close')">取消</button>
          <button class="px-4 py-2 rounded-lg bg-blue-500/80 text-white hover:bg-blue-500" @click="onImport">
            导入 ({{ selected.size }})
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
