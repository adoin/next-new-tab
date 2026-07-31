interface Wallpaper {
  url: string
  author: string
  source: string
}

interface RandomWallpaperSource {
  id: string
  name: string
  url: string
  /** redirect: 接口 302/URL 即图片；fetch: 响应体为图片二进制；bing: 内置 Bing JSON */
  kind?: 'redirect' | 'fetch' | 'bing'
}

function isBingSource(source: RandomWallpaperSource): boolean {
  return source.kind === 'bing' || source.id === 'bing'
}

function cacheBustedUrl(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}_t=${Date.now()}`
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function extractImageUrlFromJson(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const pick = (v: unknown) =>
    typeof v === 'string' && /^https?:\/\//i.test(v) ? v : null

  for (const key of ['url', 'image', 'img', 'picture', 'src']) {
    const found = pick(o[key])
    if (found) return found
  }

  if (o.data && typeof o.data === 'object') {
    const d = o.data as Record<string, unknown>
    for (const key of ['url', 'image', 'img']) {
      const found = pick(d[key])
      if (found) return found
    }
  }

  if (Array.isArray(o.images) && o.images[0] && typeof o.images[0] === 'object') {
    const img = o.images[0] as Record<string, unknown>
    const found = pick(img.url)
    if (found) return found
  }

  return null
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

// redirect — API URL 可直接作为图片地址（302 跳转等）
function getRedirectWallpaper(source: RandomWallpaperSource): Wallpaper {
  return { url: cacheBustedUrl(source.url), author: '', source: source.name }
}

// fetch — 响应体为图片，转为 data URL 以便跨标签持久化
async function getFetchedImageWallpaper(source: RandomWallpaperSource): Promise<Wallpaper> {
  const res = await fetch(cacheBustedUrl(source.url), { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const dataUrl = await blobToDataUrl(await res.blob())
  return { url: dataUrl, author: '', source: source.name }
}

// 未指定 kind 时按 Content-Type 自动判断
async function getRandomWallpaperAuto(source: RandomWallpaperSource): Promise<Wallpaper> {
  const requestUrl = cacheBustedUrl(source.url)
  const res = await fetch(requestUrl, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const ct = (res.headers.get('content-type') || '').toLowerCase()

  if (ct.startsWith('image/')) {
    const dataUrl = await blobToDataUrl(await res.blob())
    return { url: dataUrl, author: '', source: source.name }
  }

  if (ct.includes('json')) {
    const imageUrl = extractImageUrlFromJson(await res.json())
    if (imageUrl) {
      return { url: imageUrl, author: '', source: source.name }
    }
  }

  // 非图片响应：使用最终 URL（redirect 模式）
  const finalUrl = res.url && res.url.startsWith('http') ? res.url : requestUrl
  return { url: finalUrl, author: '', source: source.name }
}

async function resolveRandomWallpaper(source: RandomWallpaperSource): Promise<Wallpaper> {
  if (source.kind === 'redirect') return getRedirectWallpaper(source)
  if (source.kind === 'fetch') return getFetchedImageWallpaper(source)
  return getRandomWallpaperAuto(source)
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
        if (isBingSource(source)) {
          return { ok: true, data: await getBingDaily() }
        }
        return { ok: true, data: await resolveRandomWallpaper(source) }
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
