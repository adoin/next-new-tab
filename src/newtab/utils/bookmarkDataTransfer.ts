import type { Bookmark } from '../types'

export const BOOKMARKS_EXPORT_TYPE = 'next-new-tab-bookmarks' as const
export const BOOKMARKS_EXPORT_VERSION = 1

export interface BookmarksExportFile {
  type: typeof BOOKMARKS_EXPORT_TYPE
  version: number
  exportedAt: string
  bookmarks: Bookmark[]
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function normalizeBookmark(raw: Record<string, unknown>, order: number): Bookmark | null {
  if (typeof raw.title !== 'string' || typeof raw.url !== 'string') return null
  if (!raw.title.trim() || !raw.url.trim()) return null

  const colSpan = typeof raw.colSpan === 'number' ? raw.colSpan : 1
  const rowSpan = typeof raw.rowSpan === 'number' ? raw.rowSpan : 1
  const contentJump = raw.contentJump === true

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : crypto.randomUUID(),
    title: raw.title.trim(),
    description: typeof raw.description === 'string' ? raw.description : '',
    url: raw.url.trim(),
    icon: typeof raw.icon === 'string' ? raw.icon : '',
    iconBgColor: typeof raw.iconBgColor === 'string' ? raw.iconBgColor : 'transparent',
    colSpan: contentJump ? Math.max(2, colSpan) : Math.max(1, colSpan),
    rowSpan: Math.max(1, rowSpan),
    order,
    contentJump: contentJump || undefined,
  }
}

function extractRawList(data: unknown): unknown[] | null {
  if (Array.isArray(data)) return data
  if (!isRecord(data)) return null
  if (data.type === BOOKMARKS_EXPORT_TYPE && Array.isArray(data.bookmarks)) {
    return data.bookmarks
  }
  if (Array.isArray(data.bookmarks)) return data.bookmarks
  return null
}

export function serializeBookmarksForExport(bookmarks: Bookmark[]): string {
  const sorted = [...bookmarks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const payload: BookmarksExportFile = {
    type: BOOKMARKS_EXPORT_TYPE,
    version: BOOKMARKS_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    bookmarks: sorted.map((bm, i) => ({ ...bm, order: i })),
  }
  return JSON.stringify(payload, null, 2)
}

export function parseBookmarksImport(text: string): Bookmark[] {
  let data: unknown
  try {
    data = JSON.parse(text.trim())
  } catch {
    throw new Error('剪贴板内容不是有效的 JSON')
  }

  const list = extractRawList(data)
  if (!list?.length) {
    throw new Error('未找到书签数据（需要包含 bookmarks 数组）')
  }

  const result: Bookmark[] = []
  for (const item of list) {
    if (!isRecord(item)) continue
    const bm = normalizeBookmark(item, result.length)
    if (bm) result.push(bm)
  }

  if (result.length === 0) {
    throw new Error('没有可导入的有效书签（需包含 title 与 url）')
  }

  return result.map((bm, i) => ({ ...bm, id: crypto.randomUUID(), order: i }))
}
