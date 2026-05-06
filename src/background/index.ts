import './wallpaper-api'
import './history-api'

chrome.runtime.onInstalled.addListener(() => {
  console.log('Next New Tab installed')
})
