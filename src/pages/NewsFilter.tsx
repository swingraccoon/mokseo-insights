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
      // 캐시를 방지하기 위해 주소 뒤에 랜덤 숫자를 붙입니다.
      const response = await fetch(`/api/news?cache_bust=${Date.now()}`)
      const data = await response.json()
      setNews(data.news || [])
    } catch (err) {
      setNews([{ title: "인터넷 연결을 확인해주세요.", timestamp: "Offline", url: "#" }])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])
  useEffect(() => { localStorage.setItem("news-keywords", JSON.stringify(keywords)) }, [keywords])
  useEffect(() => { localStorage.setItem("news-bookmarks", JSON.stringify(bookmarks)) }, [bookmarks])

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
    <div className="container mx-auto max-w-4xl px-4 py-6 text-zinc-100 min-h-screen font-sans">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-orange-500 mb-1 italic tracking-tighter">Mokseo Insights</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">Coinness Live News</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 border border-zinc-800 rounded-2xl hover:bg-zinc-900"><Settings2 className="size-5 text-zinc-400" /></button>
          <button onClick={fetchNews} className="p-2 border border-zinc-800 rounded-2xl hover:bg-zinc-900"><RefreshCw className={`size-5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      {/* 탭 리스트 */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setActiveTab("ALL")} className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ALL' ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-800 text-zinc-500'}`}>전체 속보</button>
        <button onClick={() => setActiveTab("BOOKMARKS")} className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'BOOKMARKS' ? 'bg-yellow-500 border-yellow-500 text-zinc-950' : 'border-zinc-800 text-yellow-500'}`}>저장됨 ({bookmarks.length})</button>
        {keywords.map(kw => (
          <button key={kw} onClick={() => setActiveTab(kw)} className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${activeTab === kw ? 'bg-zinc-100 border-white text-zinc-950' : 'border-zinc-800 text-zinc-500'}`}>{kw}</button>
        ))}
      </div>

      <div className="space-y-4 pb-32">
        {isLoading && activeTab !== "BOOKMARKS" ? (
          <div className="text-center py-32 animate-pulse"><p className="text-zinc-600 font-bold tracking-widest text-xs uppercase">Connecting to Database...</p></div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-24 text-zinc-700 border border-zinc-900 rounded-[40px] border-dashed px-10 italic">No matches for "{activeTab}".</div>
        ) : (
          filteredNews.map((item: any, i: number) => {
            const isBookmarked = bookmarks.some(b => b.url === item.url)
            return (
              <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-7 rounded-[32px] hover:border-zinc-600 group">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/50 rounded-full border border-zinc-700/50">
                    <Clock className="size-3 text-orange-500" />
                    <span className="text-[11px] text-zinc-400 font-bold">{item.timestamp}</span>
                  </div>
                  <button onClick={() => {
                    if (isBookmarked) setBookmarks(bookmarks.filter(b => b.url !== item.url))
                    else setBookmarks([item, ...bookmarks])
                  }} className={`transition-all ${isBookmarked ? 'text-yellow-500' : 'text-zinc-700'}`}>
                    <Star className="size-5" fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>
                <h3 className="text-xl font-bold leading-snug mb-6 group-hover:text-white transition-colors">{item.title}</h3>
                <a href={item.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-zinc-500 hover:text-orange-500 flex items-center gap-1.5 uppercase tracking-widest">View Source <ExternalLink className="size-3" /></a>
              </div>
            )
          })
        )}
      </div>

      {/* 설정 모달 (기존 코드와 동일) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-[48px] w-full max-w-md shadow-2xl text-zinc-100">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black italic">Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-3 hover:bg-zinc-900 rounded-full"><X /></button>
            </div>
            <div className="flex gap-3 mb-10">
              <input type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (newKeyword && !keywords.includes(newKeyword) && setKeywords([...keywords, newKeyword], setNewKeyword("")))} placeholder="키워드 추가..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 outline-none font-bold focus:border-orange-500" />
              <button onClick={() => { if(newKeyword && !keywords.includes(newKeyword)) { setKeywords([...keywords, newKeyword]); setNewKeyword(""); } }} className="bg-orange-500 px-6 rounded-2xl font-black active:scale-90"><Plus /></button>
            </div>
            <div className="flex flex-wrap gap-2.5 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
              {keywords.map(kw => (
                <div key={kw} className="bg-zinc-900 border border-zinc-800 px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-4">
                  {kw} <X className="size-4 cursor-pointer text-zinc-600 hover:text-red-500" onClick={() => setKeywords(keywords.filter(k => k !== kw))} />
                </div>
              ))}
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-10 bg-white text-zinc-950 py-5 rounded-[24px] font-black text-lg hover:bg-orange-500 transition-all">DONE</button>
          </div>
        </div>
      )}
    </div>
  )
}
