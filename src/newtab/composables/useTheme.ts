import { ref } from 'vue'
import { getPaletteSync } from 'colorthief'

export interface ThemeColors {
  textPrimary: string
  textSecondary: string
  textMuted: string
  accent: string
  isLight: boolean
  searchText: string
  searchPlaceholder: string
  searchShadow: string
  searchIcon: string
  /** SVG feFlood 描边色（hex） */
  searchShadowFlood: string
}

type PaletteColor = {
  hsl(): { h: number; s: number; l: number }
  isLight: boolean
  hex(): string
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function hsla(h: number, s: number, l: number, a = 1) {
  return `hsla(${Math.round(h)}, ${clamp(s, 0, 100)}%, ${clamp(l, 0, 100)}%, ${a})`
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = clamp(s, 0, 100) / 100
  const lNorm = clamp(l, 0, 100) / 100
  const chroma = sNorm * Math.min(lNorm, 1 - lNorm)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    const v = lNorm - chroma * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
    return Math.round(255 * v)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

function buildTextShadow(h: number, s: number, l: number): string {
  const layer = (a: number) => hsla(h, s, l, a)
  return [
    `0 0 8px ${layer(0.95)}`,
    `0 1px 4px ${layer(0.95)}`,
    `0 -1px 2px ${layer(0.85)}`,
    `1px 0 3px ${layer(0.8)}`,
    `-1px 0 3px ${layer(0.8)}`,
  ].join(', ')
}

function pickMostSaturated(palette: PaletteColor[]) {
  let best = palette[0]
  let maxS = -1
  for (const c of palette) {
    const { s } = c.hsl()
    if (s > maxS) {
      maxS = s
      best = c
    }
  }
  return best.hsl()
}

function pickDarkest(palette: PaletteColor[]) {
  let best = palette[0]
  let minL = 101
  for (const c of palette) {
    const { l } = c.hsl()
    if (l < minL) {
      minL = l
      best = c
    }
  }
  return best.hsl()
}

function buildThemeFromPalette(palette: PaletteColor[], isLight: boolean): ThemeColors {
  const dominant = palette[0]
  const { h: dh, s: ds, l: dl } = dominant.hsl()
  const vivid = pickMostSaturated(palette)
  const deep = pickDarkest(palette)

  if (isLight) {
    const textH = deep.h
    const textS = clamp(Math.max(deep.s, ds), 32, 88)
    const textL = clamp(Math.min(deep.l, dl) + 4, 14, 30)
    const searchText = hsla(textH, textS, textL, 1)
    const searchPlaceholder = hsla(textH, textS * 0.9, textL + 6, 0.72)

    const shadowH = vivid.h
    const shadowS = clamp(Math.max(vivid.s, ds) + 8, 40, 95)
    const shadowL = clamp(Math.max(vivid.l, dl) + 32, 68, 92)

    const accent = `hsl(${Math.round(dh)}, ${clamp(ds - 10, 20, 100)}%, ${clamp(dl - 25, 20, 45)}%)`

    return {
      textPrimary: searchText,
      textSecondary: hsla(textH, textS, textL + 8, 0.72),
      textMuted: hsla(textH, textS * 0.85, textL + 14, 0.48),
      accent,
      isLight: true,
      searchText,
      searchPlaceholder,
      searchShadow: buildTextShadow(shadowH, shadowS, shadowL),
      searchIcon: searchText,
      searchShadowFlood: hslToHex(shadowH, shadowS, shadowL),
    }
  }

  const textH = dh
  const textS = clamp(ds * 0.45 + 14, 20, 58)
  const textL = clamp(dl + 38, 80, 95)
  const searchText = hsla(textH, textS, textL, 1)
  const searchPlaceholder = hsla(textH, textS * 0.85, textL - 4, 0.7)

  const shadowH = deep.h
  const shadowS = clamp(Math.max(deep.s, ds) + 18, 45, 100)
  const shadowL = clamp(Math.min(deep.l, dl) - 8, 10, 26)

  const accent = `hsl(${Math.round(dh)}, ${clamp(ds + 20, 0, 100)}%, ${clamp(dl + 30, 0, 85)}%)`

  return {
    textPrimary: searchText,
    textSecondary: hsla(textH, textS, textL - 6, 0.72),
    textMuted: hsla(textH, textS * 0.8, textL - 12, 0.48),
    accent,
    isLight: false,
    searchText,
    searchPlaceholder,
    searchShadow: buildTextShadow(shadowH, shadowS, shadowL),
    searchIcon: searchText,
    searchShadowFlood: hslToHex(shadowH, shadowS, shadowL),
  }
}

const DEFAULT_THEME = buildThemeFromPalette(
  [
    {
      hsl: () => ({ h: 220, s: 40, l: 35 }),
      isLight: false,
      hex: () => '#3d4f6f',
    },
  ],
  false,
)

const colors = ref<ThemeColors>({ ...DEFAULT_THEME })

function applyThemeCssVars(c: ThemeColors) {
  const root = document.documentElement
  root.style.setProperty('--theme-text', c.textPrimary)
  root.style.setProperty('--theme-text-secondary', c.textSecondary)
  root.style.setProperty('--theme-text-muted', c.textMuted)
  root.style.setProperty('--theme-accent', c.accent)
  root.style.setProperty('--theme-search-text', c.searchText)
  root.style.setProperty('--theme-search-placeholder', c.searchPlaceholder)
  root.style.setProperty('--theme-search-shadow', c.searchShadow)
  root.style.setProperty('--theme-search-icon', c.searchIcon)
  root.style.setProperty('--theme-search-shadow-flood', c.searchShadowFlood)
  root.style.setProperty(
    '--glass-search-bg',
    c.isLight ? 'rgba(0, 0, 0, 0.38)' : 'rgba(0, 0, 0, 0.42)',
  )
  root.style.setProperty(
    '--glass-search-border',
    c.isLight ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.28)',
  )
}

function setGlassVars(isLight: boolean) {
  const root = document.documentElement
  if (isLight) {
    root.style.setProperty('--glass-bg', 'rgba(0, 0, 0, 0.25)')
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.18)')
    root.style.setProperty('--glass-shadow', '0 4px 30px rgba(0, 0, 0, 0.25)')
    root.style.setProperty(
      '--glass-card-shadow',
      '0 10px 32px rgba(0, 0, 0, 0.38), 0 2px 10px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.06)',
    )
  } else {
    root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.15)')
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)')
    root.style.setProperty('--glass-shadow', '0 4px 30px rgba(0, 0, 0, 0.1)')
    root.style.setProperty(
      '--glass-card-shadow',
      '0 10px 36px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.08)',
    )
  }
}

function applyTheme(isLight: boolean, next: ThemeColors) {
  colors.value = next
  setGlassVars(isLight)
  applyThemeCssVars(next)
}

applyTheme(DEFAULT_THEME.isLight, { ...DEFAULT_THEME })

export function useTheme() {
  async function extractFromImage(imageUrl: string): Promise<void> {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = imageUrl

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('image load failed'))
      })

      const palette = getPaletteSync(img, { colorCount: 5 }) as PaletteColor[] | null
      if (!palette || palette.length === 0) return

      const isLight = palette[0].isLight
      applyTheme(isLight, buildThemeFromPalette(palette, isLight))
    } catch {
      applyTheme(false, { ...DEFAULT_THEME })
    }
  }

  return { colors, extractFromImage }
}
