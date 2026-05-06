<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '../stores'
import type { SearchEngine } from '../types'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const settings = useSettingsStore()

const newEngine = ref({ name: '', icon: '', urlTemplate: '', isAi: false })
const showAddEngine = ref(false)

function onAddEngine() {
  if (!newEngine.value.name || !newEngine.value.urlTemplate) return
  settings.addEngine({
    id: crypto.randomUUID(),
    ...newEngine.value,
  })
  newEngine.value = { name: '', icon: '', urlTemplate: '', isAi: false }
  showAddEngine.value = false
}

function onExport() {
  const data = {
    settings: settings.settings,
    engines: settings.engines,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'next-new-tab-config.json'
  a.click()
  URL.revokeObjectURL(url)
}

function onImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string)
      if (data.settings) Object.assign(settings.settings, data.settings)
      if (data.engines) settings.engines = data.engines
    } catch {
      alert('配置文件格式错误')
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-black/30" @click="emit('close')" />
      <div class="relative glass w-96 h-full overflow-y-auto p-6 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-white text-lg font-bold">设置</h2>
          <button class="text-white/50 hover:text-white text-xl" @click="emit('close')">✕</button>
        </div>

        <!-- Wallpaper Section -->
        <section>
          <h3 class="text-white/80 text-sm font-bold mb-3 uppercase tracking-wider">壁纸</h3>
          <div class="space-y-3">
            <div>
              <label class="text-white/60 text-xs block mb-1">模式</label>
              <select v-model="settings.settings.wallpaperMode" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none">
                <option value="api">壁纸 API</option>
                <option value="history">历史上的今天</option>
              </select>
            </div>
            <div v-if="settings.settings.wallpaperMode === 'api'">
              <label class="text-white/60 text-xs block mb-1">默认源</label>
              <select v-model="settings.settings.wallpaperSource" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none">
                <option value="bing">Bing</option>
                <option value="unsplash">Unsplash</option>
                <option value="pexels">Pexels</option>
              </select>
            </div>
            <div v-if="settings.settings.wallpaperMode === 'api'">
              <label class="text-white/60 text-xs block mb-1">Unsplash API Key</label>
              <input v-model="settings.settings.unsplashKey" type="password" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none" placeholder="可选" />
            </div>
            <div v-if="settings.settings.wallpaperMode === 'api'">
              <label class="text-white/60 text-xs block mb-1">Pexels API Key</label>
              <input v-model="settings.settings.pexelsKey" type="password" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none" placeholder="可选" />
            </div>
            <div v-if="settings.settings.wallpaperMode === 'history'">
              <label class="text-white/60 text-xs block mb-1">领域</label>
              <select v-model="settings.settings.historyDomain" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none">
                <option value="history">重大历史</option>
                <option value="football">足球</option>
                <option value="basketball">篮球</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Bookmark Section -->
        <section>
          <h3 class="text-white/80 text-sm font-bold mb-3 uppercase tracking-wider">书签</h3>
          <div class="space-y-3">
            <div>
              <label class="text-white/60 text-xs block mb-1">缩放比例 {{ settings.settings.bookmarkScale }}%</label>
              <input v-model.number="settings.settings.bookmarkScale" type="range" min="50" max="90" class="w-full accent-blue-400" />
            </div>
            <div>
              <label class="text-white/60 text-xs block mb-1">搜索栏间距 {{ settings.settings.searchGap }}px</label>
              <input v-model.number="settings.settings.searchGap" type="range" min="0" max="200" class="w-full accent-blue-400" />
            </div>
            <div>
              <label class="text-white/60 text-xs block mb-1">列数 {{ settings.settings.gridColumns }}</label>
              <input v-model.number="settings.settings.gridColumns" type="range" min="3" max="8" class="w-full accent-blue-400" />
            </div>
            <div>
              <label class="text-white/60 text-xs block mb-1">卡片圆角 {{ settings.settings.cardRadius }}px</label>
              <input v-model.number="settings.settings.cardRadius" type="range" min="0" max="20" class="w-full accent-blue-400" />
            </div>
          </div>
        </section>

        <!-- Search Section -->
        <section>
          <h3 class="text-white/80 text-sm font-bold mb-3 uppercase tracking-wider">搜索引擎</h3>
          <div class="space-y-2 mb-3">
            <div
              v-for="engine in settings.engines"
              :key="engine.id"
              class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5"
            >
              <span>{{ engine.icon }}</span>
              <span class="text-white text-sm flex-1">{{ engine.name }}</span>
              <span v-if="engine.isAi" class="text-xs text-purple-300">AI</span>
              <button class="text-white/30 hover:text-red-400 text-sm" @click="settings.removeEngine(engine.id)">✕</button>
            </div>
          </div>
          <button class="text-blue-300 text-sm hover:text-blue-200" @click="showAddEngine = !showAddEngine">
            {{ showAddEngine ? '取消' : '+ 添加引擎' }}
          </button>
          <div v-if="showAddEngine" class="mt-2 space-y-2">
            <input v-model="newEngine.name" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" placeholder="名称" />
            <input v-model="newEngine.icon" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" placeholder="图标 (emoji 或 URL)" />
            <input v-model="newEngine.urlTemplate" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" placeholder="URL 模板 (含 %s)" />
            <label class="flex items-center gap-2 text-white/60 text-sm">
              <input type="checkbox" v-model="newEngine.isAi" class="accent-purple-400" /> AI 搜索
            </label>
            <button class="w-full px-3 py-2 rounded-lg bg-blue-500/80 text-white text-sm hover:bg-blue-500" @click="onAddEngine">添加</button>
          </div>
        </section>

        <!-- General Section -->
        <section>
          <h3 class="text-white/80 text-sm font-bold mb-3 uppercase tracking-wider">通用</h3>
          <div class="flex gap-2">
            <button class="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20" @click="onExport">导出配置</button>
            <label class="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 text-center cursor-pointer">
              导入配置
              <input type="file" accept=".json" class="hidden" @change="onImport" />
            </label>
          </div>
          <button class="w-full mt-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30" @click="settings.resetSettings()">
            重置所有设置
          </button>
        </section>
      </div>
    </div>
  </Teleport>
</template>
