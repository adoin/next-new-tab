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
