import { ref, watch } from 'vue'
import type { Ref } from 'vue'

export function useStorage<T>(key: string, defaultValue: T): { data: Ref<T>; ready: Promise<void> } {
  const data = ref<T>(defaultValue) as Ref<T>

  const ready = chrome.storage.sync.get(key).then((result) => {
    if (result[key] !== undefined) {
      // guard: if default is array but stored value isn't, reset to default
      if (Array.isArray(defaultValue) && !Array.isArray(result[key])) {
        chrome.storage.sync.set({ [key]: defaultValue })
      } else {
        data.value = result[key] as T
      }
    }
  })

  let writeTimer: ReturnType<typeof setTimeout> | null = null
  watch(data, (val) => {
    if (writeTimer) clearTimeout(writeTimer)
    writeTimer = setTimeout(() => {
      chrome.storage.sync.set({ [key]: val })
    }, 500)
  }, { deep: true })

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes[key]) {
      data.value = changes[key].newValue as T
    }
  })

  return { data, ready }
}
