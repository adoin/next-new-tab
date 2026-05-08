import { ref, watch } from 'vue'
import type { Ref } from 'vue'

type StorageArea = 'sync' | 'local'

export function useStorage<T>(key: string, defaultValue: T, area: StorageArea = 'sync'): { data: Ref<T>; ready: Promise<void> } {
  const data = ref<T>(defaultValue) as Ref<T>
  const storage = chrome.storage[area]

  const ready = storage.get(key).then((result) => {
    if (result[key] !== undefined) {
      if (Array.isArray(defaultValue) && !Array.isArray(result[key])) {
        storage.set({ [key]: defaultValue })
      } else {
        data.value = result[key] as T
      }
    }
  })

  let writeTimer: ReturnType<typeof setTimeout> | null = null
  watch(data, (val) => {
    if (writeTimer) clearTimeout(writeTimer)
    writeTimer = setTimeout(() => {
      storage.set({ [key]: val })
    }, 500)
  }, { deep: true })

  chrome.storage.onChanged.addListener((changes, changeArea) => {
    if (changeArea === area && changes[key]) {
      data.value = changes[key].newValue as T
    }
  })

  return { data, ready }
}
