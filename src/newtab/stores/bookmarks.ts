import { defineStore } from 'pinia'
import type { Bookmark } from '../types'
import { useStorage } from '../composables/useStorage'
import {
  parseBookmarksImport,
  serializeBookmarksForExport,
} from '../utils/bookmarkDataTransfer'

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
const DOUBAO_CHAT_URL =
  'https://www.doubao.com/chat/url-action?action={"pluginId":"Send_Message","payload":{"text":"%s"}}'

function createDefaultBookmarks(): Bookmark[] {
  const url = normalizeUrl(DOUBAO_CHAT_URL)
  return [
    {
      id: 'default-doubao',
      title: '豆包',
      description: '',
      url,
      icon: getFaviconUrl(url),
      iconBgColor: 'transparent',
      colSpan: 2,
      rowSpan: 1,
      order: 0,
      contentJump: true,
    },
  ]
}

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
  const { data: bookmarks, ready, flush } = useStorage<Bookmark[]>('bookmarks', [], 'sync')

  function ensureArray() {
    if (!Array.isArray(bookmarks.value)) {
      bookmarks.value = []
    }
  }

  function seedDefaultBookmarksIfEmpty() {
    if (bookmarks.value.length > 0) return
    bookmarks.value = createDefaultBookmarks()
    saveNow()
    const bm = bookmarks.value[0]
    if (!bm) return
    const icon = bm.icon
    fetchHighResIcon(bm.url).then((hiRes) => {
      if (hiRes && hiRes !== icon) {
        bm.icon = hiRes
        saveNow()
      }
    })
  }

  ready.then(() => {
    ensureArray()
    seedDefaultBookmarksIfEmpty()
  })

  function saveNow() {
    const data = JSON.parse(JSON.stringify(bookmarks.value))
    chrome.storage.sync.set({ bookmarks: data }, () => {})
  }

  function addBookmark(bookmark: Omit<Bookmark, 'id' | 'order'>) {
    ensureArray()
    const id = crypto.randomUUID()
    const order = bookmarks.value.length
    const url = normalizeUrl(bookmark.url)
    const icon = bookmark.icon || getFaviconUrl(url)
    const iconBgColor = bookmark.iconBgColor || 'transparent'
    const newBm = { ...bookmark, id, order, url, icon, iconBgColor }
    bookmarks.value.push(newBm)
    saveNow()

    // async: try to get a higher-res icon from the site itself
    if (!bookmark.icon) {
      fetchHighResIcon(url).then((hiRes) => {
        if (hiRes && hiRes !== icon) {
          const bm = bookmarks.value.find((b) => b.id === id)
          if (bm) {
            bm.icon = hiRes
            saveNow()
          }
        }
      })
    }
  }

  function updateBookmark(id: string, partial: Partial<Bookmark>) {
    ensureArray()
    const bm = bookmarks.value.find((b) => b.id === id)
    if (bm) {
      Object.assign(bm, partial)
      saveNow()
    }
  }

  function removeBookmark(id: string) {
    ensureArray()
    bookmarks.value = bookmarks.value.filter((b) => b.id !== id)
    bookmarks.value.forEach((b, i) => { b.order = i })
    saveNow()
  }

  function reorderBookmarks(newOrder: Bookmark[]) {
    ensureArray()
    bookmarks.value = newOrder.map((b, i) => ({ ...b, order: i }))
    saveNow()
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
        icon: '',
        iconBgColor: 'transparent',
        colSpan: 1,
        rowSpan: 1,
      })
    }
  }

  function replaceAllBookmarks(next: Bookmark[]) {
    ensureArray()
    bookmarks.value = next.map((bm, i) => ({
      ...bm,
      id: bm.id || crypto.randomUUID(),
      order: i,
      url: normalizeUrl(bm.url),
      iconBgColor: bm.iconBgColor || 'transparent',
    }))
    saveNow()
  }

  function getExportJson(): string {
    ensureArray()
    return serializeBookmarksForExport(bookmarks.value)
  }

  async function copyBookmarksToClipboard(): Promise<number> {
    ensureArray()
    const json = serializeBookmarksForExport(bookmarks.value)
    await navigator.clipboard.writeText(json)
    return bookmarks.value.length
  }

  function importBookmarksList(imported: Bookmark[]) {
    imported.forEach((bm) => {
      if (!bm.icon) bm.icon = getFaviconUrl(bm.url)
    })
    replaceAllBookmarks(imported)
    for (const bm of bookmarks.value) {
      if (!bm.icon) continue
      const icon = bm.icon
      fetchHighResIcon(bm.url).then((hiRes) => {
        if (hiRes && hiRes !== icon) {
          bm.icon = hiRes
          saveNow()
        }
      })
    }
    return imported.length
  }

  async function importBookmarksFromClipboard(): Promise<number> {
    const text = await navigator.clipboard.readText()
    return importBookmarksList(parseBookmarksImport(text))
  }

  return {
    bookmarks,
    addBookmark,
    updateBookmark,
    removeBookmark,
    reorderBookmarks,
    importFromChrome,
    replaceAllBookmarks,
    getExportJson,
    copyBookmarksToClipboard,
    importBookmarksList,
    importBookmarksFromClipboard,
    flush,
  }
})
