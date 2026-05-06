import { useBookmarksStore } from '../stores'

export function useBookmarks() {
  const store = useBookmarksStore()

  async function getChromeBookmarks(): Promise<Array<{ title: string; url: string; id: string }>> {
    const tree = await chrome.bookmarks.getTree()
    const results: Array<{ title: string; url: string; id: string }> = []

    function walk(nodes: chrome.bookmarks.BookmarkTreeNode[]) {
      for (const node of nodes) {
        if (node.url) {
          results.push({ title: node.title, url: node.url, id: node.id })
        }
        if (node.children) walk(node.children)
      }
    }

    walk(tree)
    return results
  }

  return { ...store, getChromeBookmarks }
}
