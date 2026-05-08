// Try to fetch high-res icon from the website itself, fall back to Google API

async function fetchFavicon(domain: string): Promise<string> {
  const candidates = [
    `https://${domain}/apple-touch-icon.png`,
    `https://${domain}/apple-touch-icon-precomposed.png`,
    `https://${domain}/favicon-192x192.png`,
    `https://${domain}/favicon-96x96.png`,
  ]

  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
      if (res.ok) {
        const ct = res.headers.get('content-type') || ''
        if (ct.startsWith('image/')) return url
      }
    } catch {
      // continue
    }
  }

  // fallback: Google favicon API (128px)
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'FETCH_FAVICON') {
    const { domain } = msg.payload as { domain: string }
    fetchFavicon(domain)
      .then((url) => sendResponse({ ok: true, url }))
      .catch((e) => sendResponse({ ok: false, error: e.message }))
    return true
  }
})
