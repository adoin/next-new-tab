import { defineStore } from 'pinia'
import { useStorage } from '../composables/useStorage'
import type { Settings, SearchEngine } from '../types'
import { DEFAULT_SETTINGS, DEFAULT_ENGINES } from '../types'

export const useSettingsStore = defineStore('settings', () => {
  const { data: settings, ready: settingsReady } = useStorage<Settings>('settings', { ...DEFAULT_SETTINGS }, 'sync')
  const { data: engines, ready: enginesReady } = useStorage<SearchEngine[]>('engines', [...DEFAULT_ENGINES], 'sync')

  // Merge missing fields from defaults for existing users
  settingsReady.then(() => {
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
      if (settings.value[key] === undefined) {
        ;(settings.value as any)[key] = DEFAULT_SETTINGS[key]
      }
    }
  })

  function ensureEngines() {
    if (!Array.isArray(engines.value)) {
      engines.value = [...DEFAULT_ENGINES]
    }
  }

  enginesReady.then(ensureEngines)

  function updateSettings(partial: Partial<Settings>) {
    Object.assign(settings.value, partial)
  }

  function addEngine(engine: SearchEngine) {
    ensureEngines()
    engines.value.push(engine)
  }

  function removeEngine(id: string) {
    ensureEngines()
    const engine = engines.value.find((e) => e.id === id)
    if (engine?.builtin) return
    engines.value = engines.value.filter((e) => e.id !== id)
  }

  function updateEngine(id: string, partial: Partial<SearchEngine>) {
    ensureEngines()
    const engine = engines.value.find((e) => e.id === id)
    if (engine) Object.assign(engine, partial)
  }

  function resetSettings() {
    Object.assign(settings.value, DEFAULT_SETTINGS)
    engines.value = [...DEFAULT_ENGINES]
  }

  return { settings, engines, settingsReady, updateSettings, addEngine, removeEngine, updateEngine, resetSettings }
})
