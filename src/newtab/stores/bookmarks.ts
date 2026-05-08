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
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
  } catch {
    return ''
  }
}

export const useBookmarksStore = defineStore('bookmarks', () => {
  const { data: bookmarks, ready } = useStorage<Bookmark[]>('bookmarks', [])

  // ensure bookmarks is always an array (handle corrupted/legacy storage)
  ready.then(() => {
    if (!Array.isArray(bookmarks.value)) {
      bookmarks.value = []
    }
  })

  function addBookmark(bookmark: Omit<Bookmark, 'id' | 'order'>) {
    const id = crypto.randomUUID()
    const order = bookmarks.value.length
    const url = normalizeUrl(bookmark.url)
    const icon = bookmark.icon || getFaviconUrl(url)
    bookmarks.value.push({ ...bookmark, id, order, url, icon })
  }

  function updateBookmark(id: string, partial: Partial<Bookmark>) {
    const bm = bookmarks.value.find((b) => b.id === id)
    if (bm) Object.assign(bm, partial)
  }

  function removeBookmark(id: string) {
    bookmarks.value = bookmarks.value.filter((b) => b.id !== id)
    bookmarks.value.forEach((b, i) => { b.order = i })
  }

  function reorderBookmarks(newOrder: Bookmark[]) {
    bookmarks.value = newOrder.map((b, i) => ({ ...b, order: i }))
  }

  function importFromChrome(chromeBookmarks: Array<{ title: string; url: string }>) {
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
