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
