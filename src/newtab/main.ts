import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'virtual:uno.css'
import '../styles/glass.css'

/** 新标签页 Tab 上的小图标（与 manifest.icons 无关） */
function setTabFavicon() {
  const href = chrome.runtime.getURL('icons/icon32.png')
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    document.head.appendChild(link)
  }
  link.sizes = '32x32'
  link.href = href
}

setTabFavicon()

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
