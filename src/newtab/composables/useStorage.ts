import { ref, watch } from 'vue'
import type { Ref } from 'vue'

export function useStorage<T>(key: string, defaultValue: T): Ref<T> {
  const data = ref<T>(defaultValue) as Ref<T>

  chrome.storage.sync.get(key).then((result) => {
    if (result[key] !== undefined) {
      data.value = result[key] as T
    }
  })

  watch(data, (val) => {
    chrome.storage.sync.set({ [key]: val })
  }, { deep: true })

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes[key]) {
      data.value = changes[key].newValue as T
    }
  })

  return data
}
