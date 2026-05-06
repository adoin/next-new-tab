import { ref } from 'vue'
import type { HistoryEvent, HistoryDomain } from '../types'

export function useHistory() {
  const events = ref<HistoryEvent[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetchEvents(domain: HistoryDomain) {
    loading.value = true
    error.value = ''
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'HISTORY_GET',
        payload: { domain },
      })
      if (result.ok) {
        events.value = result.data
      } else {
        error.value = result.error
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { events, loading, error, fetchEvents }
}
