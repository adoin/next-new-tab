/** URL 是否包含内容跳转占位符（明文 %s 或编码后的 %25s） */
export function hasContentJumpPlaceholder(url: string): boolean {
  if (url.includes('%s')) return true
  if (url.includes('%25s')) return true
  try {
    return decodeURIComponent(url).includes('%s')
  } catch {
    return false
  }
}

/** 从书签 URL 提取站点根地址（protocol + host），用于带参卡片点击 logo 跳转 */
export function getBookmarkBaseUrl(url: string): string {
  let normalized = url.trim()
  if (!normalized) return url
  if (!/^https?:\/\//i.test(normalized)) {
    if (/^\/\//.test(normalized)) normalized = `https:${normalized}`
    else normalized = `https://${normalized}`
  }
  try {
    return new URL(normalized).origin
  } catch {
    return normalized
  }
}

/** 将占位符替换为编码后的用户输入 */
export function buildContentJumpUrl(url: string, content: string): string {
  const encoded = encodeURIComponent(content.trim())
  if (url.includes('%s')) {
    return url.replace(/%s/g, encoded)
  }
  if (url.includes('%25s')) {
    return url.replace(/%25s/g, encoded)
  }
  return url
}
