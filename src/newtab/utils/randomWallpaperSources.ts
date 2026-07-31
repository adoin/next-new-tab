import type { RandomWallpaperSource } from '../types'
import { RANDOM_WALLPAPER_SOURCES } from '../types'

/** 自定义图源在前，内置图源在后 */
export function getAllRandomWallpaperSources(
  custom: RandomWallpaperSource[] | undefined,
): RandomWallpaperSource[] {
  const list = normalizeRandomWallpaperSourceArray(custom)
  return [...list, ...RANDOM_WALLPAPER_SOURCES]
}

export function normalizeRandomWallpaperSourceArray(value: unknown): RandomWallpaperSource[] {
  if (Array.isArray(value)) {
    return value.filter(
      (s): s is RandomWallpaperSource =>
        !!s && typeof s.id === 'string' && typeof s.name === 'string' && typeof s.url === 'string',
    )
  }
  if (value && typeof value === 'object') {
    return Object.values(value).filter(
      (s): s is RandomWallpaperSource =>
        !!s && typeof s.id === 'string' && typeof s.name === 'string' && typeof s.url === 'string',
    )
  }
  return []
}

export function findRandomWallpaperSource(
  sourceId: string,
  custom: RandomWallpaperSource[] | undefined,
): RandomWallpaperSource | undefined {
  return getAllRandomWallpaperSources(custom).find((s) => s.id === sourceId)
}

export function createCustomRandomWallpaperSource(
  name: string,
  url: string,
): RandomWallpaperSource {
  return {
    id: `custom-${crypto.randomUUID()}`,
    name: name.trim(),
    url: url.trim(),
  }
}
