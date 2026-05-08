<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettingsStore } from '../stores'
import type { SearchEngine } from '../types'
import { RANDOM_WALLPAPER_SOURCES } from '../types'

defineProps<{ visible: boolean }>()

const emit = defineEmits<{
  close: []
  openPicker: []
}>()

const settings = useSettingsStore()

const safeEngines = computed(() =>
  Array.isArray(settings.engines) ? settings.engines : [],
)

const newEngine = ref({ name: '', icon: '', urlTemplate: '', isAi: false })
const showAddEngine = ref(false)
const editingEngineId = ref<string | null>(null)
const editForm = ref({ name: '', icon: '', urlTemplate: '', isAi: false })

function onAddEngine() {
  if (!newEngine.value.name || !newEngine.value.urlTemplate) return
  settings.addEngine({
    id: crypto.randomUUID(),
    ...newEngine.value,
  })
  newEngine.value = { name: '', icon: '', urlTemplate: '', isAi: false }
  showAddEngine.value = false
}

function onStartEdit(engine: SearchEngine) {
  editingEngineId.value = engine.id
  editForm.value = { name: engine.name, icon: engine.icon, urlTemplate: engine.urlTemplate, isAi: engine.isAi }
}

function onSaveEdit() {
  if (!editingEngineId.value) return
  settings.updateEngine(editingEngineId.value, { ...editForm.value })
  editingEngineId.value = null
}

function onCancelEdit() {
  editingEngineId.value = null
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
      <div class="relative glass w-96 h-full flex flex-col">
        <!-- fixed header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 class="text-white text-lg font-bold">设置</h2>
          <button class="text-white/50 hover:text-white text-xl" @click="emit('close')">&#x2715;</button>
        </div>

        <!-- scrollable content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">

        <!-- Wallpaper Section -->
        <section>
          <h3 class="text-white/80 text-sm font-bold mb-3 uppercase tracking-wider">壁纸</h3>
          <div class="space-y-3">
            <div>
              <label class="text-white/60 text-xs block mb-1">模式</label>
              <select v-model="settings.settings.wallpaperMode" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none">
                <option value="manual">手动选择</option>
                <option value="random">随机壁纸</option>
              </select>
            </div>

            <!-- Manual mode: button to open picker -->
            <div v-if="settings.settings.wallpaperMode === 'manual'">
              <button
                class="w-full px-3 py-2 rounded-lg bg-blue-500/60 text-white text-sm hover:bg-blue-500/80 transition-colors"
                @click="emit('openPicker')"
              >
                选择壁纸
              </button>
            </div>

            <!-- Random mode: source + interval -->
            <div v-if="settings.settings.wallpaperMode === 'random'" class="space-y-3">
              <div>
                <label class="text-white/60 text-xs block mb-1">图源</label>
                <select v-model="settings.settings.randomSourceId" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none">
                  <option v-for="s in RANDOM_WALLPAPER_SOURCES" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div>
                <label class="text-white/60 text-xs block mb-1">自动刷新间隔 {{ settings.settings.randomAutoRefreshMin }} 分钟</label>
                <input v-model.number="settings.settings.randomAutoRefreshMin" type="range" min="5" max="120" class="w-full accent-blue-400" />
              </div>
            </div>
          </div>
        </section>

        <!-- Layout Section -->
        <section>
          <h3 class="text-white/80 text-sm font-bold mb-3 uppercase tracking-wider">布局</h3>
          <div class="space-y-3">
            <div>
              <label class="text-white/60 text-xs block mb-1">搜索栏距顶 {{ settings.settings.searchTopMargin }}px</label>
              <input v-model.number="settings.settings.searchTopMargin" type="range" min="40" max="400" class="w-full accent-blue-400" />
            </div>
            <div>
              <label class="text-white/60 text-xs block mb-1">搜索栏与书签间距 {{ settings.settings.searchGap }}px</label>
              <input v-model.number="settings.settings.searchGap" type="range" min="0" max="200" class="w-full accent-blue-400" />
            </div>
            <div>
              <label class="text-white/60 text-xs block mb-1">书签缩放 {{ settings.settings.bookmarkScale }}%</label>
              <input v-model.number="settings.settings.bookmarkScale" type="range" min="50" max="90" class="w-full accent-blue-400" />
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
          <div class="space-y-1 mb-3">
            <div v-for="engine in safeEngines" :key="engine.id">
              <!-- normal display -->
              <div
                v-if="editingEngineId !== engine.id"
                class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span class="w-5 text-center text-sm">{{ engine.icon }}</span>
                <span class="text-white text-sm flex-1">{{ engine.name }}</span>
                <span v-if="engine.builtin" class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/40">内置</span>
                <span v-else-if="engine.isAi" class="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200">AI</span>
                <button
                  v-if="!engine.builtin"
                  class="text-white/30 hover:text-blue-400 text-sm transition-colors"
                  @click="onStartEdit(engine)"
                  title="编辑"
                >&#x270E;</button>
                <button
                  v-if="!engine.builtin"
                  class="text-white/30 hover:text-red-400 text-sm transition-colors"
                  @click="settings.removeEngine(engine.id)"
                  title="删除"
                >&#x2715;</button>
              </div>
              <!-- inline edit form -->
              <div v-else class="px-3 py-2 rounded-lg bg-white/5 space-y-2">
                <div class="flex gap-2">
                  <input v-model="editForm.name" class="flex-1 bg-white/10 rounded px-2 py-1 text-white text-sm outline-none" placeholder="名称" />
                  <input v-model="editForm.icon" class="w-16 bg-white/10 rounded px-2 py-1 text-white text-sm outline-none" placeholder="图标" />
                </div>
                <input v-model="editForm.urlTemplate" class="w-full bg-white/10 rounded px-2 py-1 text-white text-sm outline-none" placeholder="URL 模板 (含 %s)" />
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-1.5 text-white/60 text-xs">
                    <input type="checkbox" v-model="editForm.isAi" class="accent-purple-400" /> AI
                  </label>
                  <div class="flex gap-2">
                    <button class="text-xs text-white/50 hover:text-white" @click="onCancelEdit">取消</button>
                    <button class="text-xs text-blue-400 hover:text-blue-300" @click="onSaveEdit">保存</button>
                  </div>
                </div>
              </div>
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
        </section>
        </div>

        <!-- fixed footer -->
        <div class="px-6 py-4 border-t border-white/10 flex-shrink-0">
          <button class="w-full px-3 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30 transition-colors" @click="settings.resetSettings()">
            重置所有设置
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
