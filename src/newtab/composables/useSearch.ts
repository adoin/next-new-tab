export function useSearch() {
  function search(query: string) {
    if (!query.trim()) return
    chrome.search.query({ text: query.trim() })
  }

  return { search }
}
