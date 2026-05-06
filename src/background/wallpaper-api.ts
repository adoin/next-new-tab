interface Wallpaper {
  url: string
  author: string
  source: string
  description?: string
}

// Bing 每日一图
async function getBingDaily(): Promise<Wallpaper> {
  const res = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1')
  const data = await res.json()
  const img = data.images[0]
  return {
    url: `https://www.bing.com${img.url}`,
    author: img.copyright.split('(')[0].trim(),
    source: 'bing',
    description: img.copyright,
  }
}

// Unsplash
async function getUnsplash(keyword?: string, key?: string): Promise<Wallpaper[]> {
  if (!key) throw new Error('Unsplash API key required')
  const endpoint = keyword
    ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=10&client_id=${key}`
    : `https://api.unsplash.com/photos/random?count=10&client_id=${key}`
  const res = await fetch(endpoint)
  const data = await res.json()
  const photos = keyword ? data.results : data
  return photos.map((p: any) => ({
    url: p.urls.regular,
    author: p.user.name,
    source: 'unsplash',
    description: p.description || p.alt_description,
  }))
}

// Pexels
async function getPexels(keyword?: string, key?: string): Promise<Wallpaper[]> {
  if (!key) throw new Error('Pexels API key required')
  const endpoint = keyword
    ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=10`
    : `https://api.pexels.com/v1/curated?per_page=10`
  const res = await fetch(endpoint, { headers: { Authorization: key } })
  const data = await res.json()
  return data.photos.map((p: any) => ({
    url: p.src.large2x || p.src.large,
    author: p.photographer,
    source: 'pexels',
    description: p.alt,
  }))
}

// message handler
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'WALLPAPER_GET') {
    const { source, keyword, unsplashKey, pexelsKey } = msg.payload
    const handler = async () => {
      try {
        if (source === 'bing') {
          return { ok: true, data: await getBingDaily() }
        }
        if (source === 'unsplash') {
          return { ok: true, data: await getUnsplash(keyword, unsplashKey) }
        }
        if (source === 'pexels') {
          return { ok: true, data: await getPexels(keyword, pexelsKey) }
        }
        // fallback bing
        return { ok: true, data: await getBingDaily() }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    }
    handler().then(sendResponse)
    return true // async response
  }
})
