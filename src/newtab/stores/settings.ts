import { defineStore } from 'pinia'
import { useStorage } from '../composables/useStorage'
import type { Settings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

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
  })

  function updateSettings(partial: Partial<Settings>) {
    Object.assign(settings.value, partial)
  }

  function resetSettings() {
    Object.assign(settings.value, DEFAULT_SETTINGS)
  }

  return { settings, settingsReady, updateSettings, resetSettings }
})
