import { useState, useEffect } from "react"
import { ExternalLink, RefreshCw, Settings2, Plus, X, Star } from "lucide-react"

export function NewsFilter() {
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [keywords, setKeywords] = useState<string[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("news-keywords") : null
    return saved ? JSON.parse(saved) : ["비트코인", "BTC", "이더리움", "ETH", "솔라나", "리플", "아서 헤이즈"]
  })
  
  const [bookmarks, setBookmarks] = useState<any[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("news-bookmarks") : null
    return saved ? JSON.parse(saved) : []
  })

  const [newKeyword, setNewKeyword] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 핵심: activeTab이 바뀔 때마다 서버에 새로 검색을 요청함
  const fetchNews = async (tabName: string) => {
    if (tabName === "BOOKMARKS") return; // 북마크는 서버 호출 안 함
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/news?q=${encodeURIComponent(tabName)}`)
      const data = await response.json()
      setNews(data.news || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // 탭 변경 시 실행
  useEffect(() => {
    fetchNews(activeTab)
  }, [activeTab])

  useEffect(() => { localStorage.setItem("news-keywords", JSON.stringify(keywords)) }, [keywords])
  useEffect(() => { localStorage.setItem("news-bookmarks", JSON.stringify(bookmarks)) }, [bookmarks])

  const toggleBookmark = (item: any) => {
    const isExist = bookmarks.find(b => b.url === item.url)
    if (isExist) setBookmarks(bookmarks.filter(b => b.url !== item.url))
    else setBookmarks([item, ...bookmarks])
  }

  const currentList = activeTab === "BOOKMARKS" ? bookmarks : news

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 text-zinc-100">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-orange-500 mb-1 italic">Mokseo Insights</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Trading Room Control</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors">
            <Settings2 className="size-5 text-zinc-400" />
          </button>
          <button onClick={() => fetchNews(activeTab)} className="p-2 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors">
            <RefreshCw className={`size-5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 탭 리스트 */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setActiveTab("ALL")} className={`px-5 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ALL' ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'border-zinc-800 text-zinc-500'}`}>전체</button>
        <button onClick={() => setActiveTab("BOOKMARKS")} className={`px-5 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'BOOKMARKS' ? 'bg-yellow-500 border-yellow-500 text-zinc-950 shadow-lg' : 'border-zinc-800 text-yellow-500'}`}>
          <Star className="size-4" fill={activeTab === "BOOKMARKS" ? "currentColor" : "none"} />
          저장됨 ({bookmarks.length})
        </button>
        {keywords.map(kw => (
          <button key={kw} onClick={() => setActiveTab(kw)} className={`px-5 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${activeTab === kw ? 'bg-zinc-100 border-white text-zinc-950 shadow-lg' : 'border-zinc-800 text-zinc-500'}`}>{kw}</button>
        ))}
      </div>

      {/* 뉴스 리스트 */}
      <div className="space-y-4 pb-24">
        {isLoading && activeTab !== "BOOKMARKS" ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-medium italic">"{activeTab}" 관련 소식 찾는 중...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-20 text-zinc-600 border border-zinc-900 rounded-[32px] border-dashed">
            관련 소식이 없습니다.
          </div>
        ) : (
          currentList.map((item: any, i: number) => {
            const isBookmarked = bookmarks.some(b => b.url === item.url)
            return (
              <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[32px] hover:border-zinc-600 transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-orange-500 font-black bg-orange-500/10 px-2 py-1 rounded">Insight</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-600 font-medium">{item.timestamp}</span>
                    <button onClick={() => toggleBookmark(item)} className={`transition-colors ${isBookmarked ? 'text-yellow-500' : 'text-zinc-700 hover:text-zinc-400'}`}>
                      <Star className="size-5" fill={isBookmarked ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold leading-relaxed mb-5 group-hover:text-white transition-colors">{item.title}</h3>
                <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-zinc-500 hover:text-orange-500 flex items-center gap-1">원문 보기 <ExternalLink className="size-3" /></a>
              </div>
            )
          })
        )}
      </div>

      {/* 설정 모달은 이전과 동일하게 유지... */}
    </div>
  )
}
