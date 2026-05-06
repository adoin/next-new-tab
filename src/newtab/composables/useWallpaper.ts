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
