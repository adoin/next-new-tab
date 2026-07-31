<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBookmarksStore, useSettingsStore } from '../stores'
import { parseBookmarksImport } from '../utils/bookmarkDataTransfer'
import {
  createCustomRandomWallpaperSource,
  getAllRandomWallpaperSources,
} from '../utils/randomWallpaperSources'

const bookmarks = useBookmarksStore()

defineProps<{ visible: boolean }>()

const emit = defineEmits<{
  close: []
  openPicker: []
  openImporter: []
}>()

const settings = useSettingsStore()

const allRandomWallpaperSources = computed(() =>
  getAllRandomWallpaperSources(settings.settings.customRandomWallpaperSources),
)

const newSourceName = ref('')
const newSourceUrl = ref('')

function addCustomWallpaperSource() {
  const name = newSourceName.value.trim()
  const url = newSourceUrl.value.trim()
  if (!name) {
    alert('请填写图源名称')
    return
  }
  if (!url) {
    alert('请填写 API URL')
    return
  }
  if (!/^https?:\/\//i.test(url)) {
    alert('URL 需以 http:// 或 https:// 开头')
    return
  }
  const source = createCustomRandomWallpaperSource(name, url)
  const existing = Array.isArray(settings.settings.customRandomWallpaperSources)
    ? settings.settings.customRandomWallpaperSources
    : []
  settings.updateSettings({
    customRandomWallpaperSources: [...existing, source],
    randomSourceId: source.id,
  })
  newSourceName.value = ''
  newSourceUrl.value = ''
}

function removeCustomWallpaperSource(id: string) {
  const current = Array.isArray(settings.settings.customRandomWallpaperSources)
    ? settings.settings.customRandomWallpaperSources
    : []
  const next = current.filter((s) => s.id !== id)
  const patch: { customRandomWallpaperSources: typeof next; randomSourceId?: string } = {
    customRandomWallpaperSources: next,
  }
  if (settings.settings.randomSourceId === id) {
    patch.randomSourceId = next[0]?.id ?? allRandomWallpaperSources.value[0]?.id ?? 'picsum'
  }
  settings.updateSettings(patch)
}

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

async function onExportBookmarks() {
  try {
    const count = await bookmarks.copyBookmarksToClipboard()
    alert(`已复制 ${count} 个书签到剪贴板`)
  } catch {
    alert('复制失败，请检查是否允许访问剪贴板')
  }
}

async function onImportBookmarks() {
  try {
    const text = await navigator.clipboard.readText()
    const preview = parseBookmarksImport(text)
    const ok = confirm(
      `剪贴板中有 ${preview.length} 个书签，将替换当前全部书签，是否继续？`,
    )
    if (!ok) return
    const count = bookmarks.importBookmarksList(preview)
    bookmarks.flush()
    alert(`已导入 ${count} 个书签`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '导入失败'
    alert(msg)
  }
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
                  <option v-for="s in allRandomWallpaperSources" :key="s.id" :value="s.id">
                    {{ s.name }}
                  </option>
                </select>
              </div>

              <div class="rounded-lg border border-white/10 p-3 space-y-2">
                <div class="text-white/70 text-xs font-medium">自定义图源</div>
                <p class="text-white/40 text-xs">添加后排在列表最前；接口返回图片或 302 跳转均可，会自动识别</p>
                <ul v-if="settings.settings.customRandomWallpaperSources.length" class="space-y-1.5">
                  <li
                    v-for="s in settings.settings.customRandomWallpaperSources"
                    :key="s.id"
                    class="flex items-center gap-2 text-sm"
                  >
                    <span class="flex-1 text-white/80 truncate" :title="s.url">
                      {{ s.name }}
                    </span>
                    <button
                      type="button"
                      class="shrink-0 px-2 py-0.5 rounded text-xs text-red-300 hover:bg-red-500/20"
                      @click="removeCustomWallpaperSource(s.id)"
                    >
                      删除
                    </button>
                  </li>
                </ul>
                <div class="space-y-2 pt-1">
                  <input
                    v-model="newSourceName"
                    type="text"
                    placeholder="名称，如：我的图源"
                    class="w-full bg-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                  />
                  <input
                    v-model="newSourceUrl"
                    type="url"
                    placeholder="https://example.com/api/random"
                    class="w-full bg-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                  />
                  <button
                    type="button"
                    class="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20"
                    @click="addCustomWallpaperSource"
                  >
                    添加图源
                  </button>
                </div>
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
              <label class="text-white/60 text-xs block mb-1">搜索栏宽度 {{ settings.settings.searchBarWidthPercent }}%</label>
              <input
                v-model.number="settings.settings.searchBarWidthPercent"
                type="range"
                min="28"
                max="90"
                class="w-full accent-blue-400"
              />
            </div>
            <p class="text-white/40 text-xs -mt-1">搜索栏单独占视口宽度比例，与下方标签区宽度无关。</p>
            <div>
              <label class="text-white/60 text-xs block mb-1">标签区宽度 {{ settings.settings.bookmarkAreaWidthPercent }}%</label>
              <input
                v-model.number="settings.settings.bookmarkAreaWidthPercent"
                type="range"
                min="50"
                max="90"
                class="w-full accent-blue-400"
              />
            </div>
            <p class="text-white/40 text-xs -mt-1">书签网格区域占视口宽度比例（50%–90%）。</p>
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
              <label class="text-white/60 text-xs block mb-1">单格大小 {{ settings.settings.bookmarkCardSize }}px</label>
              <input v-model.number="settings.settings.bookmarkCardSize" type="range" min="60" max="300" class="w-full accent-blue-400" />
            </div>
            <p class="text-white/40 text-xs -mt-1">列宽自动均分；1×1 卡片为固定尺寸，列内剩余空间即卡片间距。跨列卡片铺满对应列宽。</p>
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
              <button
                type="button"
                class="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20"
                @click="onExportBookmarks"
              >
                导出书签到剪贴板
              </button>
              <button
                type="button"
                class="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20"
                @click="onImportBookmarks"
              >
                从剪贴板导入
              </button>
            </div>
            <p class="text-white/40 text-xs -mt-1">JSON 格式，导入会替换当前全部书签</p>
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
