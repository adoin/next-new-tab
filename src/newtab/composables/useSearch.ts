import { computed } from 'vue'
import { useSettingsStore } from '../stores'

export function useSearch() {
  const settings = useSettingsStore()

  const currentEngine = computed(() => {
    const list = Array.isArray(settings.engines) ? settings.engines : []
    return list.find((e) => e.id === settings.settings.defaultEngineId) || list[0]
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
        // immediate: Google API as placeholder
        settings.updateEngine(engine.id, {
          icon: `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=128`,
        })
        // async: try high-res icon from the site itself
        chrome.runtime.sendMessage({
          type: 'FETCH_FAVICON',
          payload: { domain: hostname },
        }).then((result: any) => {
          if (result.ok) {
            settings.updateEngine(engine.id, { icon: result.url })
          }
        }).catch(() => {})
      } catch {
        // ignore
      }
    }

    window.open(url, '_blank')
  }

  function switchEngine(id: string) {
    settings.updateSettings({ defaultEngineId: id })
  }

  const safeEngines = computed(() =>
    Array.isArray(settings.engines) ? settings.engines : [],
  )

  return { currentEngine, engines: safeEngines, search, switchEngine }
}
