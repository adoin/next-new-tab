import { ref } from 'vue'
import { getPaletteSync } from 'colorthief'

export interface ThemeColors {
  textPrimary: string
  textSecondary: string
  textMuted: string
  accent: string
  isLight: boolean
}

const DEFAULT_COLORS: ThemeColors = {
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.45)',
  accent: '#60a5fa',
  isLight: false,
}

function setGlassVars(isLight: boolean) {
  const root = document.documentElement
  if (isLight) {
    // light wallpaper → darken glass to stand out
    root.style.setProperty('--glass-bg', 'rgba(0, 0, 0, 0.25)')
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.18)')
    root.style.setProperty('--glass-shadow', '0 4px 30px rgba(0, 0, 0, 0.25)')
    root.style.setProperty('--glass-glow', 'rgba(0, 0, 0, 0.08)')
  } else {
    // dark wallpaper → default light glass
    root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.15)')
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)')
    root.style.setProperty('--glass-shadow', '0 4px 30px rgba(0, 0, 0, 0.1)')
    root.style.setProperty('--glass-glow', 'rgba(255, 255, 255, 0.05)')
  }
}

export function useTheme() {
  const colors = ref<ThemeColors>({ ...DEFAULT_COLORS })

  async function extractFromImage(imageUrl: string): Promise<void> {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = imageUrl

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('image load failed'))
      })

      const palette = getPaletteSync(img, { colorCount: 5 })
      if (!palette || palette.length === 0) return

      const dominant = palette[0]
      const { h, s, l } = dominant.hsl()
      const isLight = dominant.isLight

      if (!isLight) {
        // dark bg → light text
        colors.value = {
          textPrimary: '#ffffff',
          textSecondary: 'rgba(255,255,255,0.7)',
          textMuted: 'rgba(255,255,255,0.45)',
          accent: `hsl(${h}, ${Math.min(s + 20, 100)}%, ${Math.min(l + 30, 85)}%)`,
          isLight: false,
        }
      } else {
        // light bg → dark text
        colors.value = {
          textPrimary: '#1a1a2e',
          textSecondary: 'rgba(26,26,46,0.7)',
          textMuted: 'rgba(26,26,46,0.45)',
          accent: `hsl(${h}, ${Math.max(s - 10, 20)}%, ${Math.max(l - 25, 20)}%)`,
          isLight: true,
        }
      }

      setGlassVars(isLight)
    } catch {
      // fallback: keep defaults
      setGlassVars(false)
    }
  }

  return { colors, extractFromImage }
}
