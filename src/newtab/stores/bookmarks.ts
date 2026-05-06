import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Bookmark } from '../types'
import { useStorage } from '../composables/useStorage'

export const useBookmarksStore = defineStore('bookmarks', () => {
  const bookmarks = useStorage<Bookmark[]>('bookmarks', [])

  function addBookmark(bookmark: Omit<Bookmark, 'id' | 'order'>) {
    const id = crypto.randomUUID()
    const order = bookmarks.value.length
    bookmarks.value.push({ ...bookmark, id, order })
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
      addBookmark({
        title: bm.title || new URL(bm.url).hostname,
        description: '',
        url: bm.url,
        icon: `https://www.google.com/s2/favicons?domain=${new URL(bm.url).hostname}&sz=64`,
        bgImage: '',
        colSpan: 1,
        rowSpan: 1,
      })
    }
  }

  return { bookmarks, addBookmark, updateBookmark, removeBookmark, reorderBookmarks, importFromChrome }
})
