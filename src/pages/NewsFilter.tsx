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
      const response = await fetch(`/api/news?t=${Date.now()}`)
      const data = await response.json()
      setNews(data.news || [])
    } catch (err) {
      console.error("Fetch error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])

  // 필터링 로직
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
          <h2 className="text-3xl font-bold text-orange-500 mb-1 italic">Mokseo Insights</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Live Feed Diagnostic Mode</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 border border-zinc-800 rounded-2xl"><Settings2 className="size-5" /></button>
          <button onClick={fetchNews} className="p-2 border border-zinc-800 rounded-2xl"><RefreshCw className={isLoading ? 'animate-spin' : ''} /></button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setActiveTab("ALL")} className={`px-6 py-2.5 rounded-full border text-sm font-bold whitespace-nowrap ${activeTab === 'ALL' ? 'bg-orange-500 border-orange-500' : 'border-zinc-800'}`}>전체 속보</button>
        {keywords.map(kw => (
          <button key={kw} onClick={() => setActiveTab(kw)} className={`px-6 py-2.5 rounded-full border text-sm font-bold whitespace-nowrap ${activeTab === kw ? 'bg-zinc-100 text-zinc-950' : 'border-zinc-800'}`}>{kw}</button>
        ))}
      </div>

      {/* 리스트 */}
      <div className="space-y-4 pb-32">
        {isLoading ? (
          <div className="text-center py-20 animate-pulse text-zinc-500">데이터 수신 중...</div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl">
            "{activeTab}" 관련 뉴스가 보따리에 없습니다. (보따리 총 개수: {news.length}개)
          </div>
        ) : (
          filteredNews.map((item: any, i: number) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[32px]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] text-orange-500 font-black px-2 py-1 bg-orange-500/10 rounded">NEWS</span>
                <span className="text-xs text-zinc-600 font-bold">{item.timestamp}</span>
              </div>
              <h3 className="text-lg font-bold mb-4 leading-relaxed">{item.title}</h3>
              <a href={item.url} target="_blank" className="text-xs text-zinc-500 hover:text-orange-500">원문 보기</a>
            </div>
          ))
        )}
      </div>

      {/* 설정 모달... (생략) */}
    </div>
  )
}
