const CACHE_NAME = 'wallpaper-cache'
const CACHE_KEY = 'current-wallpaper'

let objectUrl: string | null = null

export async function cacheWallpaper(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    const cache = await caches.open(CACHE_NAME)
    await cache.put(CACHE_KEY, new Response(blob, {
      headers: { 'Content-Type': blob.type || 'image/jpeg' },
    }))
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrl = URL.createObjectURL(blob)
    return objectUrl
  } catch {
    return null
  }
}

export async function getCachedWallpaper(): Promise<string | null> {
  try {
    const cache = await caches.open(CACHE_NAME)
    const res = await cache.match(CACHE_KEY)
    if (!res) return null
    const blob = await res.blob()
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrl = URL.createObjectURL(blob)
    return objectUrl
  } catch {
    return null
  }
}
