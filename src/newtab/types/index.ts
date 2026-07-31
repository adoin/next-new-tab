export interface Wallpaper {
  url: string
  author: string
  source: string
}

export type RandomWallpaperSourceKind = 'redirect' | 'fetch' | 'bing'

export interface RandomWallpaperSource {
  id: string
  name: string
  url: string
  /**
   * redirect: 请求 URL 可直接当图片地址（302 跳转）
   * fetch: 响应体为图片二进制
   * bing: 内置 Bing JSON API
   * 省略时自动按 Content-Type 判断
   */
  kind?: RandomWallpaperSourceKind
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
  /** 开启后需在 URL 中包含 %s，回车时以输入内容替换 %s 后跳转 */
  contentJump?: boolean
}

export interface Settings {
  wallpaperMode: 'manual' | 'random'
  wallpaperUrl: string
  wallpaperAuthor: string
  randomSourceId: string
  randomAutoRefreshMin: number
  randomLastFetchTime: number
  /** 用户自定义随机壁纸图源，在下拉列表中排在内置图源之前 */
  customRandomWallpaperSources: RandomWallpaperSource[]
  manualCategoryId: string
  /** 标签区（搜索栏+书签）占视口宽度百分比，最大 90 */
  bookmarkAreaWidthPercent: number
  /** 搜索栏占视口宽度百分比 */
  searchBarWidthPercent: number
  searchGap: number
  searchTopMargin: number
  gridColumns: number
  cardRadius: number
  bookmarkCardSize: number
  bookmarkIconSize: number
  bookmarkOpenMode: 'newTab' | 'currentTab'
  /** 书签标题使用流动彩虹渐变字 */
  rainbowTitles: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  wallpaperMode: 'random',
  wallpaperUrl: '',
  wallpaperAuthor: '',
  randomSourceId: 'picsum',
  randomAutoRefreshMin: 30,
  randomLastFetchTime: 0,
  customRandomWallpaperSources: [],
  manualCategoryId: '9',
  bookmarkAreaWidthPercent: 85,
  searchBarWidthPercent: 42,
  searchGap: 40,
  searchTopMargin: 160,
  gridColumns: 12,
  cardRadius: 12,
  bookmarkCardSize: 100,
  bookmarkIconSize: 90,
  bookmarkOpenMode: 'newTab',
  rainbowTitles: false,
}

export const RANDOM_WALLPAPER_SOURCES: RandomWallpaperSource[] = [
  { id: 'bing', name: 'Bing 每日', url: '', kind: 'bing' },
  {
    id: 'luvbree-full',
    name: 'Luvbree 横屏（全）',
    url: 'https://www.luvbree.com/api/image/random?isNsfw=true&isLandscape=true&type=1&imageType=compressed',
  },
  {
    id: 'luvbree-sfw',
    name: 'Luvbree 横屏（安全）',
    url: 'https://www.luvbree.com/api/image/random?isNsfw=false&isLandscape=true&type=1&imageType=compressed',
  },
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
