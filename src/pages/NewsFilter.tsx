import { useState, useEffect } from "react"
import { ExternalLink, RefreshCw, Settings2, Plus, X, Star } from "lucide-react"

export function NewsFilter() {
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 1. 키워드 로드 (LocalStorage)
  const [keywords, setKeywords] = useState<string[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("news-keywords") : null
    return saved ? JSON.parse(saved) : ["비트코인", "BTC", "이더리움", "ETH", "솔라나", "리플", "아서 헤이즈"]
  })
  
  // 2. 북마크 로드 (LocalStorage)
  const [bookmarks, setBookmarks] = useState<any[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("news-bookmarks") : null
    return saved ? JSON.parse(saved) : []
  })

  const [newKeyword, setNewKeyword] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 3. 코인니스 뉴스 가져오기 함수 (배달부 호출)
  const fetchNews = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/news')
      if (!response.ok) throw new Error("데이터를 가져오지 못했습니다.")
      const data = await response.json()
      setNews(data.news || [])
    } catch (err) {
      setError("실시간 뉴스를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])
  useEffect(() => { localStorage.setItem("news-keywords", JSON.stringify(keywords)) }, [keywords])
  useEffect(() => { localStorage.setItem("news-bookmarks", JSON.stringify(bookmarks)) }, [bookmarks])

  // 북마크 토글
  const toggleBookmark = (item: any) => {
    const isExist = bookmarks.find(b => b.url === item.url)
    if (isExist) setBookmarks(bookmarks.filter(b => b.url !== item.url))
    else setBookmarks([item, ...bookmarks])
  }

  // ⭐ 띄어쓰기 무시 필터링 로직 (아서 헤이즈 문제 해결사)
  const filteredNews = activeTab === "BOOKMARKS" 
    ? bookmarks
    : activeTab === "ALL" 
      ? news 
      : news.filter((item: any) => {
          const normalizedTitle = item.title.replace(/\s+/g, '').toLowerCase();
          const normalizedKeyword = activeTab.replace(/\s+/g, '').toLowerCase();
          return normalizedTitle.includes(normalizedKeyword);
        });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 text-zinc-100">
      {/* 헤더 */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-orange-500 mb-1 italic tracking-tighter">Mokseo Insights</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">Trading Room Control</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-all">
            <Settings2 className="size-5 text-zinc-400" />
          </button>
          <button onClick={fetchNews} className="p-2 border border-zinc-800 rounded
