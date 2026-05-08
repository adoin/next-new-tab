import { ref, watch } from 'vue'
import type { Ref } from 'vue'

type StorageArea = 'sync' | 'local'

// Global write queue: batch multiple storage.set into one call
const writeQueues: Record<string, Record<string, any>> = { sync: {}, local: {} }
const writeTimers: Record<string, ReturnType<typeof setTimeout> | null> = { sync: null, local: null }

function flushWrites(area: StorageArea) {
  const pending = writeQueues[area]
  const keys = Object.keys(pending)
  if (keys.length === 0) return
  const batch: Record<string, any> = {}
  for (const k of keys) batch[k] = pending[k]
  writeQueues[area] = {}
  chrome.storage[area].set(batch)
}

function enqueueWrite(area: StorageArea, key: string, value: any) {
  writeQueues[area][key] = value
  if (writeTimers[area]) clearTimeout(writeTimers[area])
  writeTimers[area] = setTimeout(() => flushWrites(area), 2000)
}

export function useStorage<T>(key: string, defaultValue: T, area: StorageArea = 'sync'): { data: Ref<T>; ready: Promise<void> } {
  const data = ref<T>(defaultValue) as Ref<T>
  const storage = chrome.storage[area]

  const ready = storage.get(key).then((result) => {
    if (result[key] !== undefined) {
      if (Array.isArray(defaultValue) && !Array.isArray(result[key])) {
        data.value = defaultValue as T
        enqueueWrite(area, key, defaultValue)
      } else {
        data.value = result[key] as T
      }
    }
  })

  watch(data, (val) => {
    enqueueWrite(area, key, val)
  }, { deep: true })

  chrome.storage.onChanged.addListener((changes, changeArea) => {
    if (changeArea === area && changes[key]) {
      const newVal = changes[key].newValue as T
      if (Array.isArray(defaultValue) && !Array.isArray(newVal)) {
        data.value = defaultValue as T
        enqueueWrite(area, key, defaultValue)
      } else {
        data.value = newVal
      }
    }
  })

  return { data, ready }
}
