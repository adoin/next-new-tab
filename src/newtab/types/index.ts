export interface Wallpaper {
  url: string
  author: string
  source: string
}

export interface RandomWallpaperSource {
  id: string
  name: string
  url: string
}

export interface Wallpaper360Category {
  id: string
  name: string
  totalcnt: string
}

export interface Wallpaper360Item {
  pid?: string
  id?: string
  cid?: string
  class_id?: string
  url: string
  url_mobile?: string
  url_thumb?: string
  url_mid?: string
  img_1920_1080?: string
  img_1600_900?: string
  img_1440_900?: string
  img_1366_768?: string
  img_1280_800?: string
  img_1280_1024?: string
  img_1024_768?: string
  resolution?: string
  utag?: string
  fav_total?: string
  tag?: string
}

export interface Bookmark {
  id: string
  title: string
  description: string
  url: string
  icon: string
  iconBgColor: string
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
  builtin?: boolean
}

export interface Settings {
  wallpaperMode: 'manual' | 'random'
  wallpaperUrl: string
  wallpaperAuthor: string
  randomSourceId: string
  randomAutoRefreshMin: number
  randomLastFetchTime: number
  manualCategoryId: string
  bookmarkScale: number
  searchGap: number
  searchTopMargin: number
  gridColumns: number
  cardRadius: number
  defaultEngineId: string
  bookmarkCardSize: number
  cardPadding: number
  bookmarkOpenMode: 'newTab' | 'currentTab'
}

export const DEFAULT_SETTINGS: Settings = {
  wallpaperMode: 'random',
  wallpaperUrl: '',
  wallpaperAuthor: '',
  randomSourceId: 'picsum',
  randomAutoRefreshMin: 30,
  randomLastFetchTime: 0,
  manualCategoryId: '9',
  bookmarkScale: 70,
  searchGap: 40,
  searchTopMargin: 160,
  gridColumns: 12,
  cardRadius: 12,
  defaultEngineId: 'google',
  bookmarkCardSize: 100,
  cardPadding: 4,
  bookmarkOpenMode: 'newTab',
}

export const RANDOM_WALLPAPER_SOURCES: RandomWallpaperSource[] = [
  { id: 'bing', name: 'Bing 每日', url: '' },
  { id: 'picsum', name: 'Picsum', url: 'https://picsum.photos/1920/1080?random' },
  { id: 'yumehinata', name: 'YumeHinata (Pixiv)', url: 'https://rdimg.yumehinata.com/random-wallpaper' },
  { id: 'paugram', name: 'Paugram', url: 'https://api.paugram.com/wallpaper/' },
  { id: 'mtyqx', name: 'Mtyqx', url: 'https://api.mtyqx.cn/tapi/random.php' },
  { id: 'imgapi', name: 'ImgAPI', url: 'https://imgapi.cn/api.php' },
  { id: 'vsuy', name: 'Vsuy', url: 'https://api.vsuy.cn/api/api.php' },
  { id: '6045833', name: 'Random 6045833', url: 'https://api.6045833.xyz/random' },
  { id: 'qemao', name: 'Qemao (ACGN)', url: 'https://api.qemao.com/api/acgn/pc/DOLsTKl.jpg' },
  { id: '71xk', name: '71xk', url: 'https://api.71xk.com/api/picture/v1' },
  { id: 'kori', name: 'Kori', url: 'https://api.kori.moe/img' },
  { id: 'yanjiu', name: 'Yanjiu', url: 'https://img.api.yanjiu.xin/index.php?type=h' },
]

export const DEFAULT_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', icon: '🔍', urlTemplate: 'https://www.google.com/search?q=%s', isAi: false, builtin: true },
  { id: 'bing', name: 'Bing', icon: '🔎', urlTemplate: 'https://www.bing.com/search?q=%s', isAi: false, builtin: true },
  { id: 'baidu', name: '百度', icon: '🅱️', urlTemplate: 'https://www.baidu.com/s?wd=%s', isAi: false, builtin: true },
  { id: 'duckduckgo', name: 'DuckDuckGo', icon: '🦆', urlTemplate: 'https://duckduckgo.com/?q=%s', isAi: false, builtin: true },
  { id: 'doubao', name: '豆包', icon: '🫘', urlTemplate: 'https://www.doubao.com/chat/url-action?action={"pluginId":"Send_Message","payload":{"text":"%s"}}', isAi: true },
  { id: 'gemini', name: 'Gemini', icon: '✦', urlTemplate: 'https://www.google.com/search?udm=50&q=%s', isAi: true },
  { id: 'chatgpt', name: 'ChatGPT', icon: '💬', urlTemplate: 'https://chatgpt.com/?q=%s&hints=search&temporary-chat=true', isAi: true },
]
