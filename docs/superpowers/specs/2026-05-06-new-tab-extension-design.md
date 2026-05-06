# Next New Tab — Chrome 新标签页扩展设计文档

## 概述

Chrome 新标签页扩展，Vue 3 + UnoCSS + TypeScript + Vite 8 技术栈，毛玻璃风格 UI。

核心功能：
- 多源壁纸背景（壁纸 API + 历史上的今天）
- 可定制书签网格
- 可配置搜索引擎（含 AI 搜索模板）

## 架构

### 方案：SPA + Service Worker (MV3)

- Vue SPA 作为 new tab 页面
- Background service worker 处理 API 请求（绕 CSP）、定时任务
- `chrome.runtime.sendMessage` 通信

### 技术栈

| 层 | 技术 |
|----|------|
| 构建 | Vite 8 + @crxjs/vite-plugin |
| 框架 | Vue 3 + TypeScript |
| 样式 | UnoCSS + 自定义毛玻璃 CSS |
| 状态管理 | Pinia |
| 存储 | chrome.storage.sync (配置+书签) / chrome.storage.local (壁纸缓存) |
| 拖拽 | vuedraggable 或原生 drag API |

### 目录结构

```
src/
  manifest.json              # MV3 manifest
  background/
    index.ts                 # service worker 入口
    wallpaper-api.ts         # 壁纸源聚合
    history-api.ts           # 历史上的今天
  newtab/
    index.html
    main.ts
    App.vue
    components/
      WallpaperBg.vue        # 全屏背景 + 切换动画
      SearchBar.vue          # 搜索框 + 引擎切换
      BookmarkGrid.vue       # 书签网格容器
      BookmarkCard.vue       # 单个书签卡片
      BookmarkEditor.vue     # 编辑/添加弹窗
      BookmarkImporter.vue   # 浏览器书签选择器
      HistoryPanel.vue       # 历史上的今天面板
      SettingsDrawer.vue     # 设置抽屉
    composables/
      useWallpaper.ts
      useBookmarks.ts
      useSearch.ts
      useHistory.ts
      useSettings.ts
    stores/
      index.ts
    types/
      index.ts
  assets/
  styles/
    glass.css                # 毛玻璃通用样式
```

## Manifest MV3 配置

```json
{
  "manifest_version": 3,
  "name": "Next New Tab",
  "version": "0.1.0",
  "permissions": ["storage", "bookmarks"],
  "chrome_url_overrides": {
    "newtab": "newtab/index.html"
  },
  "background": {
    "service_worker": "background/index.ts",
    "type": "module"
  }
}
```

## 壁纸系统

### 两种模式

| 模式 | 数据源 | 说明 |
|------|--------|------|
| 壁纸 API | Bing / Unsplash / Pexels | 聚合多源，支持分类筛选和关键词搜索 |
| 历史上的今天 | mxnzp → oick → 维基爬取 | 按领域展示配图+事件文字 |

### 壁纸 API 模式

- Service worker 内聚合多个源，统一封装 `WallpaperSource` 接口
- 每个源实现：`getDaily()`、`getByCategory(cat)`、`search(keyword)`
- Unsplash/Pexels 需 API key，用户在设置里填
- Bing 每日一图无需 key，作为默认 fallback
- 结果缓存到 `chrome.storage.local`（URL 缓存 24h）

### 历史上的今天模式

- 多源 fallback：mxnzp.com → api.oick.nl → 维基百科爬取
- 三个领域切换：足球 / 篮球 / 重大历史
- 获取事件后，取事件相关图片作为背景，文字叠加显示
- HistoryPanel 横条展示事件卡片（年份 + 标题 + 简述）

### 壁纸 Source 接口

```ts
interface WallpaperSource {
  name: string
  getDaily(): Promise<Wallpaper>
  getByCategory(category: string): Promise<Wallpaper[]>
  search(keyword: string): Promise<Wallpaper[]>
}

interface Wallpaper {
  url: string
  author: string
  source: string
  description?: string
}
```

### 切换动画

CSS transition 淡入淡出，`background-size: cover` 自适应全屏。

## 书签系统

### Grid 布局

- CSS Grid，`grid-template-columns` 动态计算列数
- 每个卡片可独立设置占 col 和 row 数（1x1, 2x1, 1x2, 2x2）
- 支持拖拽排序

### 可调参数

| 参数 | 范围 | 存储键 |
|------|------|--------|
| 缩放比例 | 50% ~ 90% | `bookmarkScale` |
| 搜索栏与书签间距 | 0 ~ 200px | `searchGap` |
| 卡片列数 | 3 ~ 8 | `gridColumns` |
| 卡片圆角 | 0 ~ 20px | `cardRadius` |

### 数据结构

```ts
interface Bookmark {
  id: string
  title: string
  description: string
  url: string
  icon: string        // favicon URL 或自定义图
  bgImage: string     // 卡片背景图 URL（可选）
  colSpan: number     // 占几列，默认 1
  rowSpan: number     // 占几行，默认 1
  order: number       // 排序序号
}
```

### 添加书签

1. **手动编辑**：BookmarkEditor 弹窗填标题/描述/URL/背景图
2. **浏览器书签导入**：`chrome.bookmarks.getTree()` 获取书签树，BookmarkImporter 选择器挑选

### 卡片样式

- `backdrop-filter: blur(12px)` + 半透明白底
- hover 微放大 + 阴影加深
- favicon + 标题 + 描述（描述可省略）

## 搜索框

### 搜索引擎数据结构

```ts
interface SearchEngine {
  id: string
  name: string
  icon: string           // 图标 URL 或 emoji
  urlTemplate: string    // 含 %s 占位符
  isAi: boolean          // AI 搜索标记
}
```

### 默认预置

| 引擎 | URL 模板 |
|------|----------|
| Google | `https://www.google.com/search?q=%s` |
| Bing | `https://www.bing.com/search?q=%s` |
| 百度 | `https://www.baidu.com/s?wd=%s` |
| DuckDuckGo | `https://duckduckgo.com/?q=%s` |

### 自定义引擎

用户可添加任意 URL 模板，`%s` 为搜索词占位符。支持 AI 搜索如豆包：
```
https://www.doubao.com/chat/url-action?action={"pluginId":"Send_Message","payload":{"text":"%s"}}
```

### 交互

- 输入框左侧：当前引擎图标，点击弹出引擎列表切换
- 回车/搜索按钮：`encodeURIComponent` 替换 `%s` 并跳转
- 毛玻璃风格，居中偏上

## 设置系统

### 设置抽屉 (SettingsDrawer)

右上角齿轮图标打开：

| 分组 | 设置项 |
|------|--------|
| 壁纸 | 模式切换、默认源、API key 配置、历史领域选择 |
| 书签 | 缩放比例（滑块）、搜索间距（滑块）、列数、卡片圆角 |
| 搜索 | 引擎管理（增删改排序）、默认引擎选择 |
| 通用 | 数据导入/导出（JSON）、重置 |

## 存储方案

| 存储 | 内容 | API |
|------|------|-----|
| sync | 配置 + 书签数据 + 搜索引擎列表 | `chrome.storage.sync` |
| local | 壁纸 URL 缓存（24h 过期） | `chrome.storage.local` |

配置变更通过 `chrome.storage.onChanged` 监听，实时响应 UI 更新。

## UI 布局

```
┌─────────────────────────────────────┐
│         WallpaperBg (全屏)           │
│  ┌─────────────────────────────┐    │
│  │   壁纸模式 Tab 切换          │    │
│  │   [壁纸API] [历史上的今天]    │    │
│  └─────────────────────────────┘    │
│                                     │
│        ┌──────────────┐             │
│        │   SearchBar   │             │
│        └──────────────┘             │
│           ↕ 可调间距                 │
│  ┌───┬───┬───┬───┬───┐             │
│  │   │   │   │   │   │  BookmarkGrid│
│  ├───┼───┼───┤───┼───┤             │
│  │   │   │   │   │   │             │
│  └───┴───┴───┴───┴───┘             │
│                          ⚙ 设置     │
└─────────────────────────────────────┘
```

### 毛玻璃通用样式

- 背景 `rgba(255,255,255,0.15)` + `backdrop-filter: blur(12px)`
- `border: 1px solid rgba(255,255,255,0.2)`
- 深色文字，保证壁纸上可读

### 历史模式差异

- 背景变为历史事件相关图片
- 书签区下方出现 HistoryPanel 横条

## 权限 & 安全

- `permissions`: `["storage", "bookmarks"]` — 最小权限
- API key 存 sync storage，设置页用 password input 展示
- CSP：`script-src 'self'`，不允许 eval
- 外部链接用 `chrome.tabs.create` 打开

## 错误处理

- 壁纸 API 请求失败：自动 fallback 下一个源，全部失败显示纯色渐变背景
- 历史 API 失败：三级 fallback（mxnzp → oick → 维基爬取），全部失败显示默认文案
- 存储读写失败：console.error + toast 提示
- 浏览器书签权限被拒：提示用户手动添加
