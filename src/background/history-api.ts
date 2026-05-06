interface HistoryEvent {
  year: string
  title: string
  description: string
  imageUrl?: string
}

type HistoryDomain = 'football' | 'basketball' | 'history'

// mxnzp.com fallback
async function fetchMxnzp(month: number, day: number): Promise<HistoryEvent[]> {
  const res = await fetch(`https://api.mxnzp.com/api/history/today`)
  if (!res.ok) throw new Error('mxnzp failed')
  const data = await res.json()
  if (!data.data) throw new Error('mxnzp no data')
  return data.data.slice(0, 10).map((item: any) => ({
    year: item.year || '',
    title: item.title || item.event || '',
    description: item.desc || item.description || '',
  }))
}

// api.oick.nl fallback
async function fetchOick(month: number, day: number): Promise<HistoryEvent[]> {
  const res = await fetch(`https://api.oick.nl/lishi/api.php?month=${month}&day=${day}`)
  if (!res.ok) throw new Error('oick failed')
  const data = await res.json()
  if (!data.result) throw new Error('oick no data')
  return data.result.slice(0, 10).map((item: any) => ({
    year: item.year || '',
    title: item.title || '',
    description: item.desc || '',
  }))
}

// Wikipedia fallback (zh)
async function fetchWikipedia(month: number, day: number): Promise<HistoryEvent[]> {
  const monthStr = String(month).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  const res = await fetch(`https://zh.wikipedia.org/api/rest_v1/feed/onthisday/all/${monthStr}/${dayStr}`)
  if (!res.ok) throw new Error('wikipedia failed')
  const data = await res.json()
  const events = data.events || []
  return events.slice(0, 10).map((item: any) => ({
    year: String(item.year),
    title: item.text || '',
    description: item.pages?.[0]?.extract || '',
    imageUrl: item.pages?.[0]?.thumbnail?.source,
  }))
}

async function getTodayEvents(domain: HistoryDomain): Promise<HistoryEvent[]> {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  try {
    return await fetchMxnzp(month, day)
  } catch {
    try {
      return await fetchOick(month, day)
    } catch {
      try {
        return await fetchWikipedia(month, day)
      } catch {
        return []
      }
    }
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'HISTORY_GET') {
    getTodayEvents(msg.payload.domain)
      .then((events) => sendResponse({ ok: true, data: events }))
      .catch((e) => sendResponse({ ok: false, error: e.message }))
    return true
  }
})
