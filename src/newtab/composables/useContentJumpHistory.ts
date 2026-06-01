const STORAGE_PREFIX = 'nnt:content-jump:'
export const CONTENT_JUMP_HISTORY_MAX = 10

export function getContentJumpHistory(bookmarkId: string): string[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${bookmarkId}`)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .slice(0, CONTENT_JUMP_HISTORY_MAX)
  } catch {
    return []
  }
}

export function pushContentJumpHistory(bookmarkId: string, content: string): string[] {
  const trimmed = content.trim()
  if (!trimmed) return getContentJumpHistory(bookmarkId)
  const next = [trimmed, ...getContentJumpHistory(bookmarkId).filter((s) => s !== trimmed)].slice(
    0,
    CONTENT_JUMP_HISTORY_MAX,
  )
  localStorage.setItem(`${STORAGE_PREFIX}${bookmarkId}`, JSON.stringify(next))
  return next
}
