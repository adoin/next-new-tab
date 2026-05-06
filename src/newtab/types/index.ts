export interface Wallpaper {
  url: string
  author: string
  source: string
  description?: string
}

export interface WallpaperSource {
  name: string
  getDaily(): Promise<Wallpaper>
  getByCategory(category: string): Promise<Wallpaper[]>
  search(keyword: string): Promise<Wallpaper[]>
}

export interface HistoryEvent {
  year: string
  title: string
  description: string
  imageUrl?: string
}

export type HistoryDomain = 'football' | 'basketball' | 'history'

export interface Bookmark {
  id: string
  title: string
  description: string
  url: string
  icon: string
  bgImage: string
  colSpan: number
  rowSpan: number
  order: number
}

export interface SearchEngine {
  id: string
  name: string
  icon: string
  urlTemplate: string
  isAi: boolean
}

export interface Settings {
  wallpaperMode: 'api' | 'history'
  wallpaperSource: string
  unsplashKey: string
  pexelsKey: string
  historyDomain: HistoryDomain
  bookmarkScale: number
  searchGap: number
  gridColumns: number
  cardRadius: number
  defaultEngineId: string
}

export const DEFAULT_SETTINGS: Settings = {
  wallpaperMode: 'api',
  wallpaperSource: 'bing',
  unsplashKey: '',
  pexelsKey: '',
  historyDomain: 'history',
  bookmarkScale: 70,
  searchGap: 40,
  gridColumns: 5,
  cardRadius: 12,
  defaultEngineId: 'google',
}

export const DEFAULT_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', icon: '🔍', urlTemplate: 'https://www.google.com/search?q=%s', isAi: false },
  { id: 'bing', name: 'Bing', icon: '🔎', urlTemplate: 'https://www.bing.com/search?q=%s', isAi: false },
  { id: 'baidu', name: '百度', icon: '🅱️', urlTemplate: 'https://www.baidu.com/s?wd=%s', isAi: false },
  { id: 'duckduckgo', name: 'DuckDuckGo', icon: '🦆', urlTemplate: 'https://duckduckgo.com/?q=%s', isAi: false },
]
