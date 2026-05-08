import { ref, watch } from 'vue'
import type { Wallpaper, Wallpaper360Category, Wallpaper360Item } from '../types'
import { useSettingsStore } from '../stores'
import { RANDOM_WALLPAPER_SOURCES } from '../types'
import { cacheWallpaper, getCachedWallpaper } from './useWallpaperCache'

const PAGE_SIZE = 30

export function useWallpaper() {
  const settings = useSettingsStore()
  const current = ref<Wallpaper | null>(null)
  const loading = ref(false)
  const error = ref('')

  let refreshTimer: ReturnType<typeof setInterval> | null = null

  async function restoreSaved() {
    if (!settings.settings.wallpaperUrl) return
    // try cache first for instant display
    const cached = await getCachedWallpaper()
    current.value = {
      url: cached || settings.settings.wallpaperUrl,
      author: settings.settings.wallpaperAuthor || '',
      source: '',
    }
  }

  // ---- Random wallpaper ----

  async function fetchRandom() {
    loading.value = true
    error.value = ''
    try {
      const source = RANDOM_WALLPAPER_SOURCES.find(
        (s) => s.id === settings.settings.randomSourceId,
      ) || RANDOM_WALLPAPER_SOURCES[0]
      const result = await chrome.runtime.sendMessage({
        type: 'RANDOM_WALLPAPER_GET',
        payload: { source },
      })
      if (result.ok) {
        const blobUrl = await cacheWallpaper(result.data.url)
        current.value = {
          url: blobUrl || result.data.url,
          author: result.data.author || '',
          source: result.data.source || '',
        }
        settings.updateSettings({
          wallpaperUrl: result.data.url,
          wallpaperAuthor: result.data.author || '',
          randomLastFetchTime: Date.now(),
        })
      } else {
        error.value = result.error
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function startAutoRefresh() {
    stopAutoRefresh()
    const intervalMs = settings.settings.randomAutoRefreshMin * 60 * 1000
    if (intervalMs <= 0) return
    refreshTimer = setInterval(() => {
      const elapsed = Date.now() - settings.settings.randomLastFetchTime
      if (elapsed >= intervalMs) {
        fetchRandom()
      }
    }, 60_000)
  }

  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  async function initRandom() {
    const elapsed = Date.now() - settings.settings.randomLastFetchTime
    const intervalMs = settings.settings.randomAutoRefreshMin * 60 * 1000
    if (!settings.settings.wallpaperUrl || elapsed >= intervalMs) {
      await fetchRandom()
    } else {
      await restoreSaved()
    }
    startAutoRefresh()
  }

  // ---- Manual wallpaper (360) ----

  const categories = ref<Wallpaper360Category[]>([])
  const wallpapers = ref<Wallpaper360Item[]>([])
  const manualLoading = ref(false)
  const manualError = ref('')
  const activeCategoryId = ref(settings.settings.manualCategoryId || '9')
  const page = ref(1)
  const total = ref(0)
  const manualWallpaperChosen = ref(!!settings.settings.wallpaperUrl && settings.settings.wallpaperMode === 'manual')

  async function fetchCategories() {
    try {
      const result = await chrome.runtime.sendMessage({ type: 'WALLPAPER_360_CATEGORIES' })
      if (result.ok) {
        categories.value = result.data
      } else {
        console.error('Failed to fetch 360 categories:', result.error)
      }
    } catch (e: any) {
      console.error('Failed to fetch 360 categories:', e.message)
    }
  }

  async function fetchWallpapers(cid: string, pageNum = 1) {
    manualLoading.value = true
    manualError.value = ''
    try {
      const start = (pageNum - 1) * PAGE_SIZE
      const result = await chrome.runtime.sendMessage({
        type: 'WALLPAPER_360_LIST',
        payload: { cid, start, count: PAGE_SIZE },
      })
      if (result.ok) {
        wallpapers.value = result.items
        total.value = result.total
        page.value = pageNum
      } else {
        manualError.value = result.error
      }
    } catch (e: any) {
      manualError.value = e.message
    } finally {
      manualLoading.value = false
    }
  }

  function selectCategory(id: string) {
    activeCategoryId.value = id
    settings.updateSettings({ manualCategoryId: id })
    fetchWallpapers(id, 1)
  }

  function goPage(p: number) {
    fetchWallpapers(activeCategoryId.value, p)
  }

  async function setManualWallpaper(item: Wallpaper360Item) {
    const url = item.url || item.url_mobile || item.url_mid || item.url_thumb || ''
    if (!url) return
    const blobUrl = await cacheWallpaper(url)
    current.value = { url: blobUrl || url, author: item.utag || '', source: '360' }
    settings.updateSettings({ wallpaperUrl: url, wallpaperAuthor: item.utag || '' })
    manualWallpaperChosen.value = true
  }

  async function initManual() {
    await restoreSaved()
    if (categories.value.length === 0) {
      await fetchCategories()
    }
    await fetchWallpapers(activeCategoryId.value, 1)
  }

  // ---- Common ----

  async function initWallpaper() {
    stopAutoRefresh()
    await settings.settingsReady
    await fetchCategories()
    if (settings.settings.wallpaperMode === 'random') {
      await initRandom()
    } else if (manualWallpaperChosen.value) {
      await initManual()
    } else {
      // manual mode but no wallpaper chosen yet — treat as random
      await restoreSaved()
      startAutoRefresh()
    }
  }

  // Watch mode changes
  watch(() => settings.settings.wallpaperMode, async (mode) => {
    stopAutoRefresh()
    if (mode === 'manual') {
      manualWallpaperChosen.value = false
      if (categories.value.length === 0) {
        await fetchCategories()
      }
      if (wallpapers.value.length === 0) {
        await fetchWallpapers(activeCategoryId.value, 1)
      }
    } else {
      // switching back to random: just restore cached, don't force a new fetch
      await restoreSaved()
      startAutoRefresh()
    }
  })

  function cleanup() {
    stopAutoRefresh()
  }

  return {
    current,
    loading,
    error,
    initWallpaper,
    cleanup,
    // random
    fetchRandom,
    // manual
    categories,
    wallpapers,
    manualLoading,
    manualError,
    activeCategoryId,
    page,
    total,
    pageSize: PAGE_SIZE,
    manualWallpaperChosen,
    fetchCategories,
    fetchWallpapers,
    selectCategory,
    goPage,
    setManualWallpaper,
  }
}
