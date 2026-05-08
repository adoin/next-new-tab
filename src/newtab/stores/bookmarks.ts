import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Bookmark } from '../types'
import { useStorage } from '../composables/useStorage'

function normalizeUrl(url: string): string {
  if (!url) return url
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^\/\//.test(trimmed)) return `https:${trimmed}`
  return `https://${trimmed}`
}

function getFaviconUrl(url: string): string {
  try {
    const hostname = new URL(normalizeUrl(url)).hostname
    return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=128`
  } catch {
    return ''
  }
}

// Try high-res icon from the site itself, fall back to Google API
async function fetchHighResIcon(url: string): Promise<string> {
  try {
    const hostname = new URL(normalizeUrl(url)).hostname
    const result = await chrome.runtime.sendMessage({
      type: 'FETCH_FAVICON',
      payload: { domain: hostname },
    })
    return result.ok ? result.url : getFaviconUrl(url)
  } catch {
    return getFaviconUrl(url)
  }
}

export const useBookmarksStore = defineStore('bookmarks', () => {
  const { data: bookmarks, ready } = useStorage<Bookmark[]>('bookmarks', [])

  function ensureArray() {
    if (!Array.isArray(bookmarks.value)) {
      bookmarks.value = []
    }
  }

  ready.then(ensureArray)

  function addBookmark(bookmark: Omit<Bookmark, 'id' | 'order'>) {
    ensureArray()
    const id = crypto.randomUUID()
    const order = bookmarks.value.length
    const url = normalizeUrl(bookmark.url)
    const icon = bookmark.icon || getFaviconUrl(url)
    bookmarks.value.push({ ...bookmark, id, order, url, icon })

    // async: try to get a higher-res icon from the site itself
    if (!bookmark.icon) {
      fetchHighResIcon(url).then((hiRes) => {
        if (hiRes && hiRes !== icon) {
          const bm = bookmarks.value.find((b) => b.id === id)
          if (bm) bm.icon = hiRes
        }
      })
    }
  }

  function updateBookmark(id: string, partial: Partial<Bookmark>) {
    ensureArray()
    const bm = bookmarks.value.find((b) => b.id === id)
    if (bm) Object.assign(bm, partial)
  }

  function removeBookmark(id: string) {
    ensureArray()
    bookmarks.value = bookmarks.value.filter((b) => b.id !== id)
    bookmarks.value.forEach((b, i) => { b.order = i })
  }

  function reorderBookmarks(newOrder: Bookmark[]) {
    ensureArray()
    bookmarks.value = newOrder.map((b, i) => ({ ...b, order: i }))
  }

  function importFromChrome(chromeBookmarks: Array<{ title: string; url: string }>) {
    ensureArray()
    for (const bm of chromeBookmarks) {
      if (!bm.url) continue
      const url = normalizeUrl(bm.url)
      addBookmark({
        title: bm.title || new URL(url).hostname,
        description: '',
        url,
        icon: getFaviconUrl(url),
        colSpan: 1,
        rowSpan: 1,
      })
    }
  }

  return { bookmarks, addBookmark, updateBookmark, removeBookmark, reorderBookmarks, importFromChrome }
})
