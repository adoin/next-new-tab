import { defineStore } from 'pinia'
import { useStorage } from '../composables/useStorage'
import type { Settings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

/** 旧 bookmarkScale(50–100) → 新宽度百分比(50–90) */
function migrateBookmarkAreaWidth(settings: Settings & { bookmarkScale?: number }) {
  if (settings.bookmarkAreaWidthPercent !== undefined) {
    settings.bookmarkAreaWidthPercent = Math.min(
      90,
      Math.max(50, settings.bookmarkAreaWidthPercent),
    )
    return
  }
  const legacy = settings.bookmarkScale
  if (typeof legacy === 'number') {
    const t = Math.min(100, Math.max(50, legacy))
    settings.bookmarkAreaWidthPercent = Math.round(50 + ((t - 50) / 50) * 40)
  } else {
    settings.bookmarkAreaWidthPercent = DEFAULT_SETTINGS.bookmarkAreaWidthPercent
  }
  settings.bookmarkAreaWidthPercent = Math.min(
    90,
    Math.max(50, settings.bookmarkAreaWidthPercent),
  )
}

export const useSettingsStore = defineStore('settings', () => {
  const { data: settings, ready: settingsReady } = useStorage<Settings>('settings', { ...DEFAULT_SETTINGS }, 'sync')

  // Merge missing fields from defaults for existing users
  settingsReady.then(() => {
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
      if (settings.value[key] === undefined) {
        ;(settings.value as any)[key] = DEFAULT_SETTINGS[key]
      }
    }
    settings.value.gridColumns = Math.min(36, Math.max(8, settings.value.gridColumns ?? DEFAULT_SETTINGS.gridColumns))
    settings.value.bookmarkIconSize = Math.min(100, Math.max(80, settings.value.bookmarkIconSize ?? DEFAULT_SETTINGS.bookmarkIconSize))
    migrateBookmarkAreaWidth(settings.value as Settings & { bookmarkScale?: number })
    settings.value.searchBarWidthPercent = Math.min(
      90,
      Math.max(28, settings.value.searchBarWidthPercent ?? DEFAULT_SETTINGS.searchBarWidthPercent),
    )
  })

  function updateSettings(partial: Partial<Settings>) {
    Object.assign(settings.value, partial)
  }

  function resetSettings() {
    Object.assign(settings.value, DEFAULT_SETTINGS)
  }

  return { settings, settingsReady, updateSettings, resetSettings }
})
