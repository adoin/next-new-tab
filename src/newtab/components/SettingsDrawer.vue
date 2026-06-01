<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '../stores'
import { RANDOM_WALLPAPER_SOURCES } from '../types'

defineProps<{ visible: boolean }>()

const emit = defineEmits<{
  close: []
  openPicker: []
  openImporter: []
}>()

const settings = useSettingsStore()

const collapsed = ref<Record<string, boolean>>({})

function toggleSection(key: string) {
  collapsed.value[key] = !collapsed.value[key]
}

function isCollapsed(key: string) {
  return collapsed.value[key] ?? false
}

function onExport() {
  const data = {
    settings: settings.settings,
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
        <div class="flex-1 overflow-y-auto p-6 space-y-4">

        <!-- Wallpaper Section -->
        <section>
          <h3
            class="text-white/80 text-sm font-bold uppercase tracking-wider cursor-pointer flex items-center justify-between"
            @click="toggleSection('wallpaper')"
          >
            <span>壁纸</span>
            <span class="text-white/40 transition-transform" :class="{ 'rotate-180': !isCollapsed('wallpaper') }">&#x25BC;</span>
          </h3>
          <div v-show="!isCollapsed('wallpaper')" class="mt-3 space-y-3">
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
          <h3
            class="text-white/80 text-sm font-bold uppercase tracking-wider cursor-pointer flex items-center justify-between"
            @click="toggleSection('layout')"
          >
            <span>布局</span>
            <span class="text-white/40 transition-transform" :class="{ 'rotate-180': !isCollapsed('layout') }">&#x25BC;</span>
          </h3>
          <div v-show="!isCollapsed('layout')" class="mt-3 space-y-3">
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
              <input v-model.number="settings.settings.gridColumns" type="range" min="8" max="36" class="w-full accent-blue-400" />
            </div>
            <div>
              <label class="text-white/60 text-xs block mb-1">书签图标尺寸 {{ settings.settings.bookmarkIconSize }}%</label>
              <input v-model.number="settings.settings.bookmarkIconSize" type="range" min="80" max="100" class="w-full accent-blue-400" />
            </div>
            <div>
              <label class="text-white/60 text-xs block mb-1">卡片圆角 {{ settings.settings.cardRadius }}px</label>
              <input v-model.number="settings.settings.cardRadius" type="range" min="0" max="20" class="w-full accent-blue-400" />
            </div>
            <div>
              <label class="text-white/60 text-xs block mb-1">内边距 {{ settings.settings.cardPadding }}px</label>
              <input v-model.number="settings.settings.cardPadding" type="range" min="0" max="6" class="w-full accent-blue-400" />
            </div>
            <div>
              <label class="text-white/60 text-xs block mb-1">单格大小 {{ settings.settings.bookmarkCardSize }}px</label>
              <input v-model.number="settings.settings.bookmarkCardSize" type="range" min="60" max="300" class="w-full accent-blue-400" />
            </div>
          </div>
        </section>

        <!-- Behavior Section -->
        <section>
          <h3
            class="text-white/80 text-sm font-bold uppercase tracking-wider cursor-pointer flex items-center justify-between"
            @click="toggleSection('behavior')"
          >
            <span>行为</span>
            <span class="text-white/40 transition-transform" :class="{ 'rotate-180': !isCollapsed('behavior') }">&#x25BC;</span>
          </h3>
          <div v-show="!isCollapsed('behavior')" class="mt-3 space-y-3">
            <div>
              <label class="text-white/60 text-xs block mb-1">打开书签</label>
              <select v-model="settings.settings.bookmarkOpenMode" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none">
                <option value="newTab">新标签页</option>
                <option value="currentTab">当前标签页</option>
              </select>
            </div>
            <label class="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
              <input v-model="settings.settings.rainbowTitles" type="checkbox" class="accent-blue-400" />
              <span>彩虹标题</span>
            </label>
            <p class="text-white/40 text-xs -mt-1">开启后书签标题为流动渐变彩色；关闭时使用白字描边，在壁纸上更易辨认</p>
          </div>
        </section>

        <!-- General Section -->
        <section>
          <h3
            class="text-white/80 text-sm font-bold uppercase tracking-wider cursor-pointer flex items-center justify-between"
            @click="toggleSection('general')"
          >
            <span>通用</span>
            <span class="text-white/40 transition-transform" :class="{ 'rotate-180': !isCollapsed('general') }">&#x25BC;</span>
          </h3>
          <div v-show="!isCollapsed('general')" class="mt-3 space-y-3">
            <button
              class="w-full px-4 py-3 rounded-lg bg-blue-500/60 text-white text-sm hover:bg-blue-500/80 transition-colors flex items-center justify-center gap-2"
              @click="emit('openImporter')"
            >
              <span>&#x1f4e5;</span>
              <span>从浏览器导入书签</span>
            </button>
            <div class="flex gap-2">
              <button class="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20" @click="onExport">导出配置</button>
              <label class="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 text-center cursor-pointer">
                导入配置
                <input type="file" accept=".json" class="hidden" @change="onImport" />
              </label>
            </div>
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
