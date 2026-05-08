import './wallpaper-api'
import './favicon-api'

chrome.runtime.onInstalled.addListener(() => {
  console.log('Next New Tab installed')
})
