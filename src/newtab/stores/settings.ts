import { defineStore } from 'pinia'
import { useStorage } from '../composables/useStorage'
import type { Settings, SearchEngine } from '../types'
import { DEFAULT_SETTINGS, DEFAULT_ENGINES } from '../types'

export const useSettingsStore = defineStore('settings', () => {
  const { data: settings, ready: settingsReady } = useStorage<Settings>('settings', { ...DEFAULT_SETTINGS }, 'local')
  const { data: engines, ready: enginesReady } = useStorage<SearchEngine[]>('engines', [...DEFAULT_ENGINES])

  enginesReady.then(() => {
    if (!Array.isArray(engines.value)) {
      engines.value = [...DEFAULT_ENGINES]
    }
  })

  function updateSettings(partial: Partial<Settings>) {
    Object.assign(settings.value, partial)
  }

  function addEngine(engine: SearchEngine) {
    engines.value.push(engine)
  }

  function removeEngine(id: string) {
    const engine = engines.value.find((e) => e.id === id)
    if (engine?.builtin) return
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

  return { settings, engines, settingsReady, updateSettings, addEngine, removeEngine, updateEngine, resetSettings }
})
