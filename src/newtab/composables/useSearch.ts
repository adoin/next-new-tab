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

    // update engine icon to favicon on first search (skip if already a URL)
    if (!engine.icon.startsWith('http')) {
      try {
        const hostname = new URL(url).hostname
        settings.updateEngine(engine.id, {
          icon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
        })
      } catch {
        // ignore
      }
    }

    window.open(url, '_blank')
  }

  function switchEngine(id: string) {
    settings.updateSettings({ defaultEngineId: id })
  }

  return { currentEngine, engines: settings.engines, search, switchEngine }
}
