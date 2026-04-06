import { useState, useEffect } from "react"
import { ExternalLink, RefreshCw, Settings2, Plus, X, Star, Clock } from "lucide-react"

export function NewsFilter() {
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [keywords, setKeywords] = useState<string[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("news-keywords") : null
    return saved ? JSON.parse(saved) : ["비트코인", "BTC", "아서 헤이즈"]
  })
  
  const [bookmarks, setBookmarks] = useState<any[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("news-bookmarks") : null
    return saved ? JSON.parse(saved) : []
  })

  const [newKeyword, setNewKeyword] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const fetchNews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/news')
      const data = await response.json()
      setNews(data.news || [])
    } catch (err) {
      console.error("수신 오류")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])

  // ⭐ 띄어쓰기 무시하고 오직 코인니스 속보만 필터링
  const filteredNews = activeTab === "BOOKMARKS" 
    ? bookmarks
    : activeTab === "ALL" 
      ? news 
      : news.filter((item: any) => {
          const cleanTitle = item.title.replace(/\s+/g, '').toLowerCase();
          const cleanKeyword = activeTab.replace(/\s+/g, '').toLowerCase();
          return cleanTitle.includes(cleanKeyword);
        });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 text-zinc-100">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-orange-500 mb-1 italic italic tracking-tighter">Mokseo Insights</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">Coinness Live Feed</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-all"><Settings2 className="size-5 text-zinc-400" /></button>
          <button onClick={fetchNews} className="p-2 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-all"><RefreshCw className={`size-5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setActiveTab("ALL")} className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ALL' ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-800 text-zinc-500'}`}>전체 속보</button>
        <button onClick={() => setActiveTab("BOOKMARKS")} className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'BOOKMARKS' ? 'bg-yellow-500 border-yellow-500 text-zinc-950' : 'border-zinc-800 text-yellow-500'}`}>저장됨 ({bookmarks.length})</button>
        {keywords.map(kw => (
          <button key={kw} onClick={() => setActiveTab(kw)} className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${activeTab === kw ? 'bg-zinc-100 border-white text-zinc-950' : 'border-zinc-800 text-zinc-500'}`}>{kw}</button>
        ))}
      </div>

      {/* 뉴스 리스트 */}
      <div className="space-y-4 pb-32">
        {isLoading && activeTab !== "BOOKMARKS" ? (
          <div className="text-center py-32"><div className="size-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-zinc-600 font-bold tracking-widest">LOADING LIVE FEED...</p></div>
        ) : (
          filteredNews.map((item: any, i: number) => {
            const isBookmarked = bookmarks.some(b => b.url === item.url)
            return (
              <div key={i} className="bg-zinc-900/30 border border-zinc-800 p-7 rounded-[32px] hover:border-zinc-600 transition-all group">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-2 text-orange-500">
                    <Clock className="size-3" />
                    <span className="text-xs font-black tracking-tight">{item.timestamp}</span>
                  </div>
                  <button onClick={() => {
                    const isExist = bookmarks.find(b => b.url === item.url)
                    if (isExist) setBookmarks(bookmarks.filter(b => b.url !== item.url))
                    else setBookmarks([item, ...bookmarks])
                  }} className={`transition-all ${isBookmarked ? 'text-yellow-500' : 'text-zinc-700 hover:text-zinc-400'}`}>
                    <Star className="size-5" fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>
                <h3 className="text-xl font-bold leading-snug mb-6 group-hover:text-white transition-colors">{item.title}</h3>
                <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-orange-500 transition-colors uppercase tracking-widest font-sans">View Source <ExternalLink className="size-3" /></a>
              </div>
            )
          })
        )}
      </div>

      {/* 설정 모달... (이전 코드 유지) */}
    </div>
  )
}
