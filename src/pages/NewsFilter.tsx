import { useState, useEffect } from "react"
import { ExternalLink, RefreshCw, Settings2, Plus, X, Star } from "lucide-react"

export function NewsFilter() {
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [keywords, setKeywords] = useState<string[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("news-keywords") : null
    return saved ? JSON.parse(saved) : ["비트코인", "BTC", "이더리움", "ETH", "솔라나", "리플"]
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
    setError(null)
    try {
      const response = await fetch('/api/news')
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

  const toggleBookmark = (item: any) => {
    const isExist = bookmarks.find(b => b.url === item.url)
    if (isExist) {
      setBookmarks(bookmarks.filter(b => b.url !== item.url))
    } else {
      setBookmarks([item, ...bookmarks])
    }
  }

  // ⭐ 핵심: 띄어쓰기 무시 필터링 로직
  const filteredNews = activeTab === "BOOKMARKS" 
    ? bookmarks
    : activeTab === "ALL" 
      ? news 
      : news.filter((item: any) => {
          // 1. 뉴스 제목에서 공백 제거 + 소문자 변환
          const normalizedTitle = item.title.replace(/\s+/g, '').toLowerCase();
          // 2. 검색 키워드에서 공백 제거 + 소문자 변환
          const normalizedKeyword = activeTab.replace(/\s+/g, '').toLowerCase();
          
          return normalizedTitle.includes(normalizedKeyword);
        })

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
          <button onClick={fetchNews} className="p-2 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors">
            <RefreshCw className={`size-5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab("ALL")}
          className={`px-5 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ALL' ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'border-zinc-800 text-zinc-500'}`}
        >전체</button>
        <button 
          onClick={() => setActiveTab("BOOKMARKS")}
          className={`px-5 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'BOOKMARKS' ? 'bg-yellow-500 border-yellow-500 text-zinc-950 shadow-lg' : 'border-zinc-800 text-yellow-500'}`}
        >
          <Star className="size-4" fill={activeTab === "BOOKMARKS" ? "currentColor" : "none"} />
          저장됨 ({bookmarks.length})
        </button>
        {keywords.map(kw => (
          <button 
            key={kw}
            onClick={() => setActiveTab(kw)}
            className={`px-5 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${activeTab === kw ? 'bg-zinc-100 border-white text-zinc-950 shadow-lg' : 'border-zinc-800 text-zinc-500'}`}
          >{kw}</button>
        ))}
      </div>

      <div className="space-y-4 pb-24">
        {isLoading && activeTab !== "BOOKMARKS" ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-medium">실시간 정보 수신 중...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-20 text-zinc-600 border border-zinc-900 rounded-3xl border-dashed">
            {activeTab === "BOOKMARKS" ? "저장된 뉴스가 없습니다." : `"${activeTab}" 관련 뉴스가 없습니다.`}
          </div>
        ) : (
          filteredNews.map((item: any, i: number) => {
            const isBookmarked = bookmarks.some(b => b.url === item.url)
            return (
              <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-600 transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-orange-500 font-black bg-orange-500/10 px-2 py-1 rounded">Flash News</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-600 font-medium">{item.timestamp}</span>
                    <button onClick={() => toggleBookmark(item)} className={`transition-colors ${isBookmarked ? 'text-yellow-500' : 'text-zinc-700 hover:text-zinc-400'}`}>
                      <Star className="size-5" fill={isBookmarked ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold leading-relaxed mb-5 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-zinc-500 hover:text-orange-500 flex items-center gap-1">
                  원문 보기 <ExternalLink className="size-3" />
                </a>
              </div>
            )
          })
        )}
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[40px] w-full max-w-md">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">키워드 관리</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-zinc-900 rounded-full"><X /></button>
            </div>
            <div className="flex gap-2 mb-8">
              <input 
                type="text" 
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (newKeyword && !keywords.includes(newKeyword) && setKeywords([...keywords, newKeyword], setNewKeyword("")))}
                placeholder="추가할 키워드..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 text-white focus:border-orange-500 outline-none"
              />
              <button onClick={() => { if(newKeyword && !keywords.includes(newKeyword)) { setKeywords([...keywords, newKeyword]); setNewKeyword(""); } }} className="bg-orange-500 px-5 rounded-2xl font-bold"><Plus /></button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {keywords.map(kw => (
                <div key={kw} className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-sm flex items-center gap-3">
                  {kw} <X className="size-4 cursor-pointer text-zinc-600 hover:text-red-500" onClick={() => setKeywords(keywords.filter(k => k !== kw))} />
                </div>
              ))}
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-8 bg-white text-zinc-950 py-4 rounded-2xl font-black transition-colors">적용 완료</button>
          </div>
        </div>
      )}
    </div>
  )
}
