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
  chrome.storage[area].set(batch, () => {})
}

function enqueueWrite(area: StorageArea, key: string, value: any) {
  writeQueues[area][key] = value
  if (writeTimers[area]) clearTimeout(writeTimers[area])
  writeTimers[area] = setTimeout(() => flushWrites(area), 2000)
}

function writeImmediate(area: StorageArea, key: string, value: any) {
  if (writeTimers[area]) {
    clearTimeout(writeTimers[area])
    writeTimers[area] = null
  }
  chrome.storage[area].set({ [key]: value }, () => {})
  delete writeQueues[area][key]
}

// Flush all pending writes immediately (for page unload)
export function flushAllWrites() {
  flushWrites('sync')
  flushWrites('local')
}

// Register unload handler once
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushAllWrites)
}

export function useStorage<T>(key: string, defaultValue: T, area: StorageArea = 'sync'): { data: Ref<T>; ready: Promise<void>; flush: () => void } {
  const data = ref<T>(defaultValue) as Ref<T>
  const storage = chrome.storage[area]
  let isLoading = true

  const ready = storage.get(key).then((result) => {
    const stored = result[key]

    if (stored !== undefined && stored !== null) {
      if (Array.isArray(defaultValue)) {
        if (Array.isArray(stored)) {
          data.value = stored as T
        } else if (typeof stored === 'object') {
          const arr = Object.values(stored)
          data.value = arr.length > 0 ? (arr as T) : (defaultValue as T)
        } else {
          data.value = defaultValue as T
        }
      } else {
        data.value = stored as T
      }
    }

    isLoading = false
  })

  // Watch for changes and save
  watch(data, (val) => {
    if (isLoading) return
    enqueueWrite(area, key, val)
  }, { deep: true })

  // Listen for changes from other tabs
  chrome.storage.onChanged.addListener((changes, changeArea) => {
    if (changeArea === area && changes[key]) {
      const newVal = changes[key].newValue as T
      if (Array.isArray(defaultValue)) {
        if (Array.isArray(newVal)) data.value = newVal
      } else {
        data.value = newVal
      }
    }
  })

  function flush() {
    writeImmediate(area, key, data.value)
  }

  return { data, ready, flush }
}
