interface Wallpaper {
  url: string
  author: string
  source: string
}

interface RandomWallpaperSource {
  id: string
  name: string
  url: string
}

// Bing daily wallpaper
async function getBingDaily(): Promise<Wallpaper> {
  const res = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1')
  const data = await res.json()
  const img = data.images[0]
  return {
    url: `https://www.bing.com${img.url}`,
    author: img.copyright.split('(')[0].trim(),
    source: 'Bing',
  }
}

// Random wallpaper — fetch image and return as data URL so it persists across tabs
async function getRandomWallpaper(source: RandomWallpaperSource): Promise<Wallpaper> {
  const sep = source.url.includes('?') ? '&' : '?'
  const url = `${source.url}${sep}_t=${Date.now()}`
  const res = await fetch(url)
  const blob = await res.blob()
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  return { url: dataUrl, author: '', source: source.name }
}

// 360 wallpaper — categories
async function get360Categories() {
  const url = 'http://wallpaper.apc.360.cn/index.php?c=WallPaperAndroid&a=getAllCategories'
  const res = await fetch(url)
  const json = await res.json()
  return json.data || []
}

// 360 wallpaper — list by category
async function get360ByCategory(cid: string, start: number, count: number) {
  const url = `http://wallpaper.apc.360.cn/index.php?c=WallPaperAndroid&a=getAppsByCategory&cid=${cid}&start=${start}&count=${count}`
  const res = await fetch(url)
  const json = await res.json()
  return { items: json.data || [], total: Number(json.total) || 0 }
}

// Message handler
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'RANDOM_WALLPAPER_GET') {
    const { source } = msg.payload as { source: RandomWallpaperSource }
    const handler = async () => {
      try {
        if (source.id === 'bing') {
          return { ok: true, data: await getBingDaily() }
        }
        return { ok: true, data: await getRandomWallpaper(source) }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    }
    handler().then(sendResponse)
    return true
  }

  if (msg.type === 'WALLPAPER_360_CATEGORIES') {
    get360Categories()
      .then((data) => sendResponse({ ok: true, data }))
      .catch((e) => sendResponse({ ok: false, error: e.message }))
    return true
  }

  if (msg.type === 'WALLPAPER_360_LIST') {
    const { cid, start, count } = msg.payload
    get360ByCategory(cid, start, count)
      .then((data) => sendResponse({ ok: true, ...data }))
      .catch((e) => sendResponse({ ok: false, error: e.message }))
    return true
  }
})
