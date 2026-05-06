# Next New Tab Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chrome 新标签页扩展，多源壁纸 + 可定制书签网格 + 可配置搜索引擎，毛玻璃风格。

**Architecture:** Vue 3 SPA 作为 new tab 页面，Background service worker 处理 API 请求和缓存，chrome.storage.sync 存配置和书签，chrome.storage.local 存壁纸缓存。

**Tech Stack:** Vue 3, Vite 8, @crxjs/vite-plugin 2.4.0, UnoCSS, TypeScript, Pinia
**Package Manager:** pnpm

---

## File Structure

```
src/
  manifest.json
  background/
    index.ts
    wallpaper-api.ts
    history-api.ts
  newtab/
    index.html
    main.ts
    App.vue
    components/
      WallpaperBg.vue
      SearchBar.vue
      BookmarkGrid.vue
      BookmarkCard.vue
      BookmarkEditor.vue
      BookmarkImporter.vue
      HistoryPanel.vue
      SettingsDrawer.vue
    composables/
      useStorage.ts
      useWallpaper.ts
      useBookmarks.ts
      useSearch.ts
      useHistory.ts
      useSettings.ts
    stores/
      index.ts
      settings.ts
      bookmarks.ts
      search.ts
    types/
      index.ts
  styles/
    glass.css
```

---

### Task 1: 项目脚手架

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `uno.config.ts`
- Create: `src/manifest.json`
- Create: `src/newtab/index.html`, `src/newtab/main.ts`, `src/newtab/App.vue`
- Create: `src/background/index.ts`

- [ ] **Step 1: 初始化项目**

```bash
cd D:/workspace/next-new-tab
pnpm init
```

- [ ] **Step 2: 安装依赖**

```bash
pnpm add vue@3 pinia
pnpm add -D vite@8 @crxjs/vite-plugin@2.4.0 typescript @vitejs/plugin-vue unocss @unocss/reset vitest vue-tsc
```

- [ ] **Step 3: 创建 vite.config.ts**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest.json'

export default defineConfig({
  plugins: [vue(), UnoCSS(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        newtab: 'src/newtab/index.html',
      },
    },
  },
})
```

- [ ] **Step 4: 创建 uno.config.ts**

```ts
import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetIcons()],
})
```

- [ ] **Step 5: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["chrome"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"]
}
```

- [ ] **Step 6: 创建 src/manifest.json**

```json
{
  "manifest_version": 3,
  "name": "Next New Tab",
  "version": "0.1.0",
  "description": "Beautiful new tab with wallpapers, bookmarks and search",
  "permissions": ["storage", "bookmarks"],
  "chrome_url_overrides": {
    "newtab": "newtab/index.html"
  },
  "background": {
    "service_worker": "background/index.ts",
    "type": "module"
  }
}
```

- [ ] **Step 7: 创建 src/newtab/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Tab</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./main.ts"></script>
</body>
</html>
```

- [ ] **Step 8: 创建 src/newtab/main.ts**

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'virtual:uno.css'
import '../styles/glass.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

- [ ] **Step 9: 创建 src/newtab/App.vue 骨架**

```vue
<script setup lang="ts">
</script>

<template>
  <div class="relative w-screen h-screen overflow-hidden">
    <p class="text-white text-2xl">Next New Tab</p>
  </div>
</template>
```

- [ ] **Step 10: 创建 src/background/index.ts**

```ts
chrome.runtime.onInstalled.addListener(() => {
  console.log('Next New Tab installed')
})
```

- [ ] **Step 11: 创建 src/styles/glass.css**

```css
.glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.glass-dark {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
```

- [ ] **Step 12: 添加 package.json scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 13: 验证构建**

```bash
pnpm build
```

Expected: 构建成功，在 `dist/` 生成扩展文件。

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: project scaffolding with Vue 3 + Vite 8 + CRXJS + UnoCSS"
```

---

### Task 2: 类型定义 & 存储层

**Files:**
- Create: `src/newtab/types/index.ts`
- Create: `src/newtab/composables/useStorage.ts`

- [ ] **Step 1: 创建 src/newtab/types/index.ts**

```ts
export interface Wallpaper {
  url: string
  author: string
  source: string
  description?: string
}

export interface WallpaperSource {
  name: string
  getDaily(): Promise<Wallpaper>
  getByCategory(category: string): Promise<Wallpaper[]>
  search(keyword: string): Promise<Wallpaper[]>
}

export interface HistoryEvent {
  year: string
  title: string
  description: string
  imageUrl?: string
}

export type HistoryDomain = 'football' | 'basketball' | 'history'

export interface Bookmark {
  id: string
  title: string
  description: string
  url: string
  icon: string
  bgImage: string
  colSpan: number
  rowSpan: number
  order: number
}

export interface SearchEngine {
  id: string
  name: string
  icon: string
  urlTemplate: string
  isAi: boolean
}

export interface Settings {
  // wallpaper
  wallpaperMode: 'api' | 'history'
  wallpaperSource: string
  unsplashKey: string
  pexelsKey: string
  historyDomain: HistoryDomain
  // bookmark
  bookmarkScale: number
  searchGap: number
  gridColumns: number
  cardRadius: number
  // search
  defaultEngineId: string
}

export const DEFAULT_SETTINGS: Settings = {
  wallpaperMode: 'api',
  wallpaperSource: 'bing',
  unsplashKey: '',
  pexelsKey: '',
  historyDomain: 'history',
  bookmarkScale: 70,
  searchGap: 40,
  gridColumns: 5,
  cardRadius: 12,
  defaultEngineId: 'google',
}

export const DEFAULT_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', icon: '🔍', urlTemplate: 'https://www.google.com/search?q=%s', isAi: false },
  { id: 'bing', name: 'Bing', icon: '🔎', urlTemplate: 'https://www.bing.com/search?q=%s', isAi: false },
  { id: 'baidu', name: '百度', icon: '🅱️', urlTemplate: 'https://www.baidu.com/s?wd=%s', isAi: false },
  { id: 'duckduckgo', name: 'DuckDuckGo', icon: '🦆', urlTemplate: 'https://duckduckgo.com/?q=%s', isAi: false },
]
```

- [ ] **Step 2: 创建 src/newtab/composables/useStorage.ts**

```ts
import { ref, watch } from 'vue'
import type { Ref } from 'vue'

export function useStorage<T>(key: string, defaultValue: T): Ref<T> {
  const data = ref<T>(defaultValue) as Ref<T>

  // load from chrome.storage.sync
  chrome.storage.sync.get(key).then((result) => {
    if (result[key] !== undefined) {
      data.value = result[key]
    }
  })

  // save on change
  watch(data, (val) => {
    chrome.storage.sync.set({ [key]: val })
  }, { deep: true })

  // listen external changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes[key]) {
      data.value = changes[key].newValue
    }
  })

  return data
}
```

- [ ] **Step 3: Commit**

```bash
git add src/newtab/types src/newtab/composables/useStorage.ts
git commit -m "feat: type definitions and storage composable"
```

---

### Task 3: Settings Store & Composable

**Files:**
- Create: `src/newtab/stores/settings.ts`
- Create: `src/newtab/composables/useSettings.ts`
- Create: `src/newtab/stores/index.ts`

- [ ] **Step 1: 创建 src/newtab/stores/settings.ts**

```ts
import { defineStore } from 'pinia'
import { useStorage } from '../composables/useStorage'
import type { Settings, SearchEngine } from '../types'
import { DEFAULT_SETTINGS, DEFAULT_ENGINES } from '../types'

export const useSettingsStore = defineStore('settings', () => {
  const settings = useStorage<Settings>('settings', { ...DEFAULT_SETTINGS })
  const engines = useStorage<SearchEngine[]>('engines', [...DEFAULT_ENGINES])

  function updateSettings(partial: Partial<Settings>) {
    Object.assign(settings.value, partial)
  }

  function addEngine(engine: SearchEngine) {
    engines.value.push(engine)
  }

  function removeEngine(id: string) {
    engines.value = engines.value.filter((e) => e.id !== id)
  }

  function updateEngine(id: string, partial: Partial<SearchEngine>) {
    const engine = engines.value.find((e) => e.id === id)
    if (engine) Object.assign(engine, partial)
  }

  function resetSettings() {
    Object.assign(settings.value, DEFAULT_SETTINGS)
    engines.value = [...DEFAULT_ENGINES]
  }

  return { settings, engines, updateSettings, addEngine, removeEngine, updateEngine, resetSettings }
})
```

- [ ] **Step 2: 创建 src/newtab/stores/index.ts**

```ts
export { useSettingsStore } from './settings'
```

- [ ] **Step 3: Commit**

```bash
git add src/newtab/stores
git commit -m "feat: settings store with storage sync"
```

---

### Task 4: 壁纸系统 — Background Service Worker

**Files:**
- Create: `src/background/wallpaper-api.ts`
- Modify: `src/background/index.ts`

- [ ] **Step 1: 创建 src/background/wallpaper-api.ts**

```ts
interface Wallpaper {
  url: string
  author: string
  source: string
  description?: string
}

// Bing 每日一图
async function getBingDaily(): Promise<Wallpaper> {
  const res = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1')
  const data = await res.json()
  const img = data.images[0]
  return {
    url: `https://www.bing.com${img.url}`,
    author: img.copyright.split('(')[0].trim(),
    source: 'bing',
    description: img.copyright,
  }
}

// Unsplash
async function getUnsplash(keyword?: string, key?: string): Promise<Wallpaper[]> {
  if (!key) throw new Error('Unsplash API key required')
  const endpoint = keyword
    ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=10&client_id=${key}`
    : `https://api.unsplash.com/photos/random?count=10&client_id=${key}`
  const res = await fetch(endpoint)
  const data = await res.json()
  const photos = keyword ? data.results : data
  return photos.map((p: any) => ({
    url: p.urls.regular,
    author: p.user.name,
    source: 'unsplash',
    description: p.description || p.alt_description,
  }))
}

// Pexels
async function getPexels(keyword?: string, key?: string): Promise<Wallpaper[]> {
  if (!key) throw new Error('Pexels API key required')
  const endpoint = keyword
    ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=10`
    : `https://api.pexels.com/v1/curated?per_page=10`
  const res = await fetch(endpoint, { headers: { Authorization: key } })
  const data = await res.json()
  return data.photos.map((p: any) => ({
    url: p.src.large2x || p.src.large,
    author: p.photographer,
    source: 'pexels',
    description: p.alt,
  }))
}

// message handler
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'WALLPAPER_GET') {
    const { source, keyword, unsplashKey, pexelsKey } = msg.payload
    const handler = async () => {
      try {
        if (source === 'bing') {
          return { ok: true, data: await getBingDaily() }
        }
        if (source === 'unsplash') {
          return { ok: true, data: await getUnsplash(keyword, unsplashKey) }
        }
        if (source === 'pexels') {
          return { ok: true, data: await getPexels(keyword, pexelsKey) }
        }
        // fallback bing
        return { ok: true, data: await getBingDaily() }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    }
    handler().then(sendResponse)
    return true // async response
  }
})
```

- [ ] **Step 2: 更新 src/background/index.ts**

```ts
import './wallpaper-api'

chrome.runtime.onInstalled.addListener(() => {
  console.log('Next New Tab installed')
})
```

- [ ] **Step 3: Commit**

```bash
git add src/background
git commit -m "feat: wallpaper API aggregation in service worker"
```

---

### Task 5: 壁纸 Composable & 组件

**Files:**
- Create: `src/newtab/composables/useWallpaper.ts`
- Create: `src/newtab/components/WallpaperBg.vue`

- [ ] **Step 1: 创建 src/newtab/composables/useWallpaper.ts**

```ts
import { ref } from 'vue'
import type { Wallpaper } from '../types'
import { useSettingsStore } from '../stores'

export function useWallpaper() {
  const settings = useSettingsStore()
  const current = ref<Wallpaper | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function fetchWallpaper(keyword?: string) {
    loading.value = true
    error.value = ''
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'WALLPAPER_GET',
        payload: {
          source: settings.settings.wallpaperSource,
          keyword,
          unsplashKey: settings.settings.unsplashKey,
          pexelsKey: settings.settings.pexelsKey,
        },
      })
      if (result.ok) {
        current.value = Array.isArray(result.data) ? result.data[0] : result.data
      } else {
        error.value = result.error
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function searchWallpapers(keyword: string): Promise<Wallpaper[]> {
    const result = await chrome.runtime.sendMessage({
      type: 'WALLPAPER_GET',
      payload: {
        source: settings.settings.wallpaperSource,
        keyword,
        unsplashKey: settings.settings.unsplashKey,
        pexelsKey: settings.settings.pexelsKey,
      },
    })
    return result.ok ? (Array.isArray(result.data) ? result.data : [result.data]) : []
  }

  return { current, loading, error, fetchWallpaper, searchWallpapers }
}
```

- [ ] **Step 2: 创建 src/newtab/components/WallpaperBg.vue**

```vue
<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useWallpaper } from '../composables/useWallpaper'
import { useSettingsStore } from '../stores'

const props = defineProps<{ mode: 'api' | 'history' }>()
const { current, loading, fetchWallpaper } = useWallpaper()
const settings = useSettingsStore()

const fallbackGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

onMounted(() => {
  if (props.mode === 'api') fetchWallpaper()
})

watch(() => props.mode, (m) => {
  if (m === 'api') fetchWallpaper()
})

defineExpose({ fetchWallpaper })
</script>

<template>
  <div
    class="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
    :style="{
      backgroundImage: current ? `url(${current.url})` : fallbackGradient,
      opacity: loading ? 0.5 : 1,
    }"
  >
    <slot />
    <div v-if="current" class="absolute bottom-4 right-4 text-white/60 text-sm">
      {{ current.author }} · {{ current.source }}
    </div>
  </div>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add src/newtab/composables/useWallpaper.ts src/newtab/components/WallpaperBg.vue
git commit -m "feat: wallpaper composable and background component"
```

---

### Task 6: 历史上的今天 — Background Service Worker

**Files:**
- Create: `src/background/history-api.ts`
- Modify: `src/background/index.ts`

- [ ] **Step 1: 创建 src/background/history-api.ts**

```ts
interface HistoryEvent {
  year: string
  title: string
  description: string
  imageUrl?: string
}

type HistoryDomain = 'football' | 'basketball' | 'history'

// mxnzp.com fallback
async function fetchMxnzp(month: number, day: number): Promise<HistoryEvent[]> {
  const res = await fetch(`https://api.mxnzp.com/api/history/today`)
  if (!res.ok) throw new Error('mxnzp failed')
  const data = await res.json()
  if (!data.data) throw new Error('mxnzp no data')
  return data.data.slice(0, 10).map((item: any) => ({
    year: item.year || '',
    title: item.title || item.event || '',
    description: item.desc || item.description || '',
  }))
}

// api.oick.nl fallback
async function fetchOick(month: number, day: number): Promise<HistoryEvent[]> {
  const res = await fetch(`https://api.oick.nl/lishi/api.php?month=${month}&day=${day}`)
  if (!res.ok) throw new Error('oick failed')
  const data = await res.json()
  if (!data.result) throw new Error('oick no data')
  return data.result.slice(0, 10).map((item: any) => ({
    year: item.year || '',
    title: item.title || '',
    description: item.desc || '',
  }))
}

// Wikipedia fallback (zh)
async function fetchWikipedia(month: number, day: number): Promise<HistoryEvent[]> {
  const monthStr = String(month).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  const res = await fetch(`https://zh.wikipedia.org/api/rest_v1/feed/onthisday/all/${monthStr}/${dayStr}`)
  if (!res.ok) throw new Error('wikipedia failed')
  const data = await res.json()
  const events = data.events || []
  return events.slice(0, 10).map((item: any) => ({
    year: String(item.year),
    title: item.text || '',
    description: item.pages?.[0]?.extract || '',
    imageUrl: item.pages?.[0]?.thumbnail?.source,
  }))
}

async function getTodayEvents(domain: HistoryDomain): Promise<HistoryEvent[]> {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  // domain-specific filtering happens on client side
  // APIs return general history, client filters by domain keywords
  try {
    return await fetchMxnzp(month, day)
  } catch {
    try {
      return await fetchOick(month, day)
    } catch {
      try {
        return await fetchWikipedia(month, day)
      } catch {
        return []
      }
    }
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'HISTORY_GET') {
    getTodayEvents(msg.payload.domain)
      .then((events) => sendResponse({ ok: true, data: events }))
      .catch((e) => sendResponse({ ok: false, error: e.message }))
    return true
  }
})
```

- [ ] **Step 2: 更新 src/background/index.ts**

```ts
import './wallpaper-api'
import './history-api'

chrome.runtime.onInstalled.addListener(() => {
  console.log('Next New Tab installed')
})
```

- [ ] **Step 3: Commit**

```bash
git add src/background/history-api.ts src/background/index.ts
git commit -m "feat: history-of-today API with triple fallback"
```

---

### Task 7: 历史 Composable & 组件

**Files:**
- Create: `src/newtab/composables/useHistory.ts`
- Create: `src/newtab/components/HistoryPanel.vue`

- [ ] **Step 1: 创建 src/newtab/composables/useHistory.ts**

```ts
import { ref } from 'vue'
import type { HistoryEvent, HistoryDomain } from '../types'

export function useHistory() {
  const events = ref<HistoryEvent[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetchEvents(domain: HistoryDomain) {
    loading.value = true
    error.value = ''
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'HISTORY_GET',
        payload: { domain },
      })
      if (result.ok) {
        events.value = result.data
      } else {
        error.value = result.error
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { events, loading, error, fetchEvents }
}
```

- [ ] **Step 2: 创建 src/newtab/components/HistoryPanel.vue**

```vue
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
```

- [ ] **Step 3: Commit**

```bash
git add src/newtab/composables/useHistory.ts src/newtab/components/HistoryPanel.vue
git commit -m "feat: history composable and panel component"
```

---

### Task 8: 书签 Store & Composable

**Files:**
- Create: `src/newtab/stores/bookmarks.ts`
- Modify: `src/newtab/stores/index.ts`
- Create: `src/newtab/composables/useBookmarks.ts`

- [ ] **Step 1: 创建 src/newtab/stores/bookmarks.ts**

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Bookmark } from '../types'
import { useStorage } from '../composables/useStorage'

export const useBookmarksStore = defineStore('bookmarks', () => {
  const bookmarks = useStorage<Bookmark[]>('bookmarks', [])

  function addBookmark(bookmark: Omit<Bookmark, 'id' | 'order'>) {
    const id = crypto.randomUUID()
    const order = bookmarks.value.length
    bookmarks.value.push({ ...bookmark, id, order })
  }

  function updateBookmark(id: string, partial: Partial<Bookmark>) {
    const bm = bookmarks.value.find((b) => b.id === id)
    if (bm) Object.assign(bm, partial)
  }

  function removeBookmark(id: string) {
    bookmarks.value = bookmarks.value.filter((b) => b.id !== id)
    // reorder
    bookmarks.value.forEach((b, i) => { b.order = i })
  }

  function reorderBookmarks(newOrder: Bookmark[]) {
    bookmarks.value = newOrder.map((b, i) => ({ ...b, order: i }))
  }

  function importFromChrome(chromeBookmarks: Array<{ title: string; url: string }>) {
    for (const bm of chromeBookmarks) {
      if (!bm.url) continue
      addBookmark({
        title: bm.title || new URL(bm.url).hostname,
        description: '',
        url: bm.url,
        icon: `https://www.google.com/s2/favicons?domain=${new URL(bm.url).hostname}&sz=64`,
        bgImage: '',
        colSpan: 1,
        rowSpan: 1,
      })
    }
  }

  return { bookmarks, addBookmark, updateBookmark, removeBookmark, reorderBookmarks, importFromChrome }
})
```

- [ ] **Step 2: 更新 src/newtab/stores/index.ts**

```ts
export { useSettingsStore } from './settings'
export { useBookmarksStore } from './bookmarks'
```

- [ ] **Step 3: 创建 src/newtab/composables/useBookmarks.ts**

```ts
import { useBookmarksStore } from '../stores'

export function useBookmarks() {
  const store = useBookmarksStore()

  async function getChromeBookmarks(): Promise<Array<{ title: string; url: string; id: string }>> {
    const tree = await chrome.bookmarks.getTree()
    const results: Array<{ title: string; url: string; id: string }> = []

    function walk(nodes: chrome.bookmarks.BookmarkTreeNode[]) {
      for (const node of nodes) {
        if (node.url) {
          results.push({ title: node.title, url: node.url, id: node.id })
        }
        if (node.children) walk(node.children)
      }
    }

    walk(tree)
    return results
  }

  return { ...store, getChromeBookmarks }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/newtab/stores/bookmarks.ts src/newtab/stores/index.ts src/newtab/composables/useBookmarks.ts
git commit -m "feat: bookmarks store and composable with Chrome import"
```

---

### Task 9: 搜索 Composable

**Files:**
- Create: `src/newtab/composables/useSearch.ts`

- [ ] **Step 1: 创建 src/newtab/composables/useSearch.ts**

```ts
import { computed } from 'vue'
import { useSettingsStore } from '../stores'

export function useSearch() {
  const settings = useSettingsStore()

  const currentEngine = computed(() => {
    return settings.engines.find((e) => e.id === settings.settings.defaultEngineId)
      || settings.engines[0]
  })

  function search(query: string) {
    if (!query.trim()) return
    const engine = currentEngine.value
    const encoded = encodeURIComponent(query.trim())
    const url = engine.urlTemplate.replace('%s', encoded)
    window.location.href = url
  }

  function switchEngine(id: string) {
    settings.updateSettings({ defaultEngineId: id })
  }

  return { currentEngine, engines: settings.engines, search, switchEngine }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/newtab/composables/useSearch.ts
git commit -m "feat: search composable with engine switching"
```

---

### Task 10: SearchBar 组件

**Files:**
- Create: `src/newtab/components/SearchBar.vue`

- [ ] **Step 1: 创建 src/newtab/components/SearchBar.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useSearch } from '../composables/useSearch'

const { currentEngine, engines, search, switchEngine } = useSearch()
const query = ref('')
const showEngines = ref(false)

function onSubmit() {
  search(query.value)
}

function onSelectEngine(id: string) {
  switchEngine(id)
  showEngines.value = false
}
</script>

<template>
  <div class="relative w-full max-w-xl mx-auto">
    <form @submit.prevent="onSubmit" class="glass flex items-center gap-2 px-4 py-3">
      <button
        type="button"
        class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg"
        @click="showEngines = !showEngines"
      >
        {{ currentEngine.icon }}
      </button>
      <input
        v-model="query"
        type="text"
        :placeholder="`用 ${currentEngine.name} 搜索...`"
        class="flex-1 bg-transparent outline-none text-white placeholder-white/50 text-lg"
      />
      <button
        type="submit"
        class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white/70"
      >
        ➜
      </button>
    </form>

    <!-- Engine selector dropdown -->
    <div v-if="showEngines" class="absolute top-full left-0 right-0 mt-2 glass p-2 z-50">
      <button
        v-for="engine in engines"
        :key="engine.id"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors text-white text-left"
        :class="{ 'bg-white/10': engine.id === currentEngine.id }"
        @click="onSelectEngine(engine.id)"
      >
        <span class="text-lg">{{ engine.icon }}</span>
        <span>{{ engine.name }}</span>
        <span v-if="engine.isAi" class="text-xs text-purple-300 ml-auto">AI</span>
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/newtab/components/SearchBar.vue
git commit -m "feat: SearchBar component with engine switching"
```

---

### Task 11: BookmarkCard 组件

**Files:**
- Create: `src/newtab/components/BookmarkCard.vue`

- [ ] **Step 1: 创建 src/newtab/components/BookmarkCard.vue**

```vue
<script setup lang="ts">
import type { Bookmark } from '../types'

const props = defineProps<{
  bookmark: Bookmark
  scale: number
  radius: number
}>()

const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

function open() {
  window.location.href = props.bookmark.url
}
</script>

<template>
  <div
    class="glass group relative cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl overflow-hidden"
    :style="{
      gridColumn: `span ${bookmark.colSpan}`,
      gridRow: `span ${bookmark.rowSpan}`,
      borderRadius: `${radius}px`,
    }"
    @click="open"
  >
    <!-- optional bg image -->
    <div
      v-if="bookmark.bgImage"
      class="absolute inset-0 bg-cover bg-center opacity-30"
      :style="{ backgroundImage: `url(${bookmark.bgImage})` }"
    />

    <div class="relative p-3 flex flex-col items-center justify-center h-full gap-1">
      <img
        v-if="bookmark.icon"
        :src="bookmark.icon"
        :alt="bookmark.title"
        class="w-10 h-10 rounded-lg object-contain"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div class="text-white font-medium text-sm text-center line-clamp-1">{{ bookmark.title }}</div>
      <div
        v-if="bookmark.description"
        class="text-white/50 text-xs text-center line-clamp-2"
      >
        {{ bookmark.description }}
      </div>
    </div>

    <!-- edit/delete buttons on hover -->
    <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        class="w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white text-xs hover:bg-black/60"
        @click.stop="emit('edit', bookmark.id)"
      >
        ✎
      </button>
      <button
        class="w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white text-xs hover:bg-red-500/60"
        @click.stop="emit('delete', bookmark.id)"
      >
        ✕
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/newtab/components/BookmarkCard.vue
git commit -m "feat: BookmarkCard component with glass style"
```

---

### Task 12: BookmarkGrid 组件

**Files:**
- Create: `src/newtab/components/BookmarkGrid.vue`

- [ ] **Step 1: 创建 src/newtab/components/BookmarkGrid.vue**

```vue
<script setup lang="ts">
import { useBookmarksStore, useSettingsStore } from '../stores'
import BookmarkCard from './BookmarkCard.vue'

const bookmarks = useBookmarksStore()
const settings = useSettingsStore()

const emit = defineEmits<{
  edit: [id: string]
  add: []
}>()

function onDelete(id: string) {
  bookmarks.removeBookmark(id)
}
</script>

<template>
  <div
    class="w-full mx-auto"
    :style="{
      maxWidth: `${settings.settings.gridColumns * 140 * (settings.settings.bookmarkScale / 100)}px`,
      transform: `scale(${settings.settings.bookmarkScale / 100})`,
      transformOrigin: 'top center',
    }"
  >
    <div
      class="grid gap-3"
      :style="{
        gridTemplateColumns: `repeat(${settings.settings.gridColumns}, 1fr)`,
      }"
    >
      <BookmarkCard
        v-for="bm in bookmarks.bookmarks"
        :key="bm.id"
        :bookmark="bm"
        :scale="settings.settings.bookmarkScale"
        :radius="settings.settings.cardRadius"
        @edit="emit('edit', $event)"
        @delete="onDelete"
      />

      <!-- add button -->
      <button
        class="glass flex items-center justify-center aspect-square cursor-pointer hover:scale-105 transition-transform"
        :style="{ borderRadius: `${settings.settings.cardRadius}px` }"
        @click="emit('add')"
      >
        <span class="text-white/50 text-3xl">+</span>
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/newtab/components/BookmarkGrid.vue
git commit -m "feat: BookmarkGrid with dynamic columns and scale"
```

---

### Task 13: BookmarkEditor 组件

**Files:**
- Create: `src/newtab/components/BookmarkEditor.vue`

- [ ] **Step 1: 创建 src/newtab/components/BookmarkEditor.vue**

```vue
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
  bgImage: '',
  colSpan: 1,
  rowSpan: 1,
})

watch(() => props.visible, (v) => {
  if (v && props.editId) {
    const bm = bookmarks.bookmarks.find((b) => b.id === props.editId)
    if (bm) {
      form.value = { ...bm }
    }
  } else if (v) {
    form.value = { title: '', description: '', url: '', icon: '', bgImage: '', colSpan: 1, rowSpan: 1 }
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
          <div>
            <label class="text-white/70 text-sm block mb-1">背景图 URL</label>
            <input v-model="form.bgImage" class="w-full bg-white/10 rounded-lg px-3 py-2 text-white outline-none" placeholder="可选" />
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
```

- [ ] **Step 2: Commit**

```bash
git add src/newtab/components/BookmarkEditor.vue
git commit -m "feat: BookmarkEditor modal with form"
```

---

### Task 14: BookmarkImporter 组件

**Files:**
- Create: `src/newtab/components/BookmarkImporter.vue`

- [ ] **Step 1: 创建 src/newtab/components/BookmarkImporter.vue**

```vue
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
```

- [ ] **Step 2: Commit**

```bash
git add src/newtab/components/BookmarkImporter.vue
git commit -m "feat: BookmarkImporter with Chrome bookmarks tree"
```

---

### Task 15: SettingsDrawer 组件

**Files:**
- Create: `src/newtab/components/SettingsDrawer.vue`

- [ ] **Step 1: 创建 src/newtab/components/SettingsDrawer.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '../stores'
import type { SearchEngine } from '../types'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const settings = useSettingsStore()

// new engine form
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
```

- [ ] **Step 2: Commit**

```bash
git add src/newtab/components/SettingsDrawer.vue
git commit -m "feat: SettingsDrawer with wallpaper/bookmark/search config"
```

---

### Task 16: App.vue 整合

**Files:**
- Modify: `src/newtab/App.vue`

- [ ] **Step 1: 更新 src/newtab/App.vue**

```vue
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useSettingsStore } from './stores'
import { useHistory } from './composables/useHistory'
import WallpaperBg from './components/WallpaperBg.vue'
import SearchBar from './components/SearchBar.vue'
import BookmarkGrid from './components/BookmarkGrid.vue'
import BookmarkEditor from './components/BookmarkEditor.vue'
import BookmarkImporter from './components/BookmarkImporter.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'

const settings = useSettingsStore()
const { events, loading: historyLoading, fetchEvents } = useHistory()

const showSettings = ref(false)
const showEditor = ref(false)
const showImporter = ref(false)
const editId = ref<string | null>(null)
const wallpaperBg = ref<InstanceType<typeof WallpaperBg> | null>(null)

function onEditBookmark(id: string) {
  editId.value = id
  showEditor.value = true
}

function onAddBookmark() {
  editId.value = null
  showEditor.value = true
}

function onCloseEditor() {
  showEditor.value = false
  editId.value = null
}

// fetch history when mode changes
watch(() => settings.settings.wallpaperMode, (mode) => {
  if (mode === 'history') {
    fetchEvents(settings.settings.historyDomain)
  }
})

watch(() => settings.settings.historyDomain, (domain) => {
  if (settings.settings.wallpaperMode === 'history') {
    fetchEvents(domain)
  }
})

onMounted(() => {
  if (settings.settings.wallpaperMode === 'history') {
    fetchEvents(settings.settings.historyDomain)
  }
})
</script>

<template>
  <WallpaperBg ref="wallpaperBg" :mode="settings.settings.wallpaperMode">
    <div class="relative z-10 w-full h-full flex flex-col items-center justify-start pt-[10vh] px-4">
      <!-- mode tabs -->
      <div class="glass flex gap-1 p-1 mb-8">
        <button
          class="px-4 py-1.5 rounded-lg text-sm transition-colors"
          :class="settings.settings.wallpaperMode === 'api' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'"
          @click="settings.updateSettings({ wallpaperMode: 'api' })"
        >
          壁纸
        </button>
        <button
          class="px-4 py-1.5 rounded-lg text-sm transition-colors"
          :class="settings.settings.wallpaperMode === 'history' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'"
          @click="settings.updateSettings({ wallpaperMode: 'history' })"
        >
          历史上的今天
        </button>
      </div>

      <!-- search bar -->
      <SearchBar />

      <!-- spacer -->
      <div :style="{ height: `${settings.settings.searchGap}px` }" />

      <!-- bookmarks -->
      <BookmarkGrid @edit="onEditBookmark" @add="onAddBookmark" />

      <!-- history panel -->
      <HistoryPanel
        v-if="settings.settings.wallpaperMode === 'history'"
        :events="events"
        :loading="historyLoading"
        class="mt-6"
      />
    </div>

    <!-- settings button -->
    <button
      class="fixed bottom-6 right-6 z-20 glass w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-full"
      @click="showSettings = true"
    >
      ⚙
    </button>

    <!-- importer button -->
    <button
      class="fixed bottom-6 right-20 z-20 glass w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-full"
      @click="showImporter = true"
      title="从浏览器导入书签"
    >
      📥
    </button>
  </WallpaperBg>

  <BookmarkEditor :visible="showEditor" :edit-id="editId" @close="onCloseEditor" />
  <BookmarkImporter :visible="showImporter" @close="showImporter = false" />
  <SettingsDrawer :visible="showSettings" @close="showSettings = false" />
</template>
```

- [ ] **Step 2: 验证构建**

```bash
pnpm build
```

Expected: 构建成功，无 TS 错误。

- [ ] **Step 3: Commit**

```bash
git add src/newtab/App.vue
git commit -m "feat: integrate all components in App.vue"
```

---

### Task 17: 最终验证 & 清理

- [ ] **Step 1: 构建验证**

```bash
pnpm build
```

Expected: `dist/` 目录包含完整扩展文件，manifest.json 正确。

- [ ] **Step 2: 加载扩展测试**

1. 打开 `chrome://extensions`
2. 开启开发者模式
3. 加载已解压的扩展 → 选择 `dist/`
4. 打开新标签页验证：
   - 壁纸加载（Bing 默认）
   - 搜索框功能
   - 书签添加/编辑/删除
   - 设置面板
   - 模式切换

- [ ] **Step 3: 最终 Commit**

```bash
git add -A
git commit -m "feat: next new tab extension v0.1.0"
```
