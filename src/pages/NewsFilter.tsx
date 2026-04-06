import { useState, useEffect } from "react"
import { ExternalLink, RefreshCw, Settings2, Plus, X, Star, Calendar } from "lucide-react"

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

  const fetchNews = async (tabName: string) => {
    if (tabName === "BOOKMARKS") return;
    setIsLoading(true)
    try {
      const response = await fetch(`/api/news?q=${encodeURIComponent(tabName)}&t=${Date.now()}`)
      const data = await response.json()
      setNews(data.news || [])
    } catch (err) { console.error(err) } finally { setIsLoading(false) }
  }

  useEffect(() => { fetchNews(activeTab) }, [activeTab])
  useEffect(() => { localStorage.setItem("news-keywords", JSON.stringify(keywords)) }, [keywords])
  useEffect(() => { localStorage.setItem("news-bookmarks", JSON.stringify(bookmarks)) }, [bookmarks])

  const toggleBookmark = (item: any) => {
    const isExist = bookmarks.find(b => b.url === item.url)
    if (isExist) setBookmarks(bookmarks.filter(b => b.url !== item.url))
    else setBookmarks([item, ...bookmarks])
  }

  const currentList = activeTab === "BOOKMARKS" ? bookmarks : news

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 text-zinc-100 min-h-screen">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-orange-500 mb-1 italic tracking-tighter">Mokseo Insights</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black font-sans">30-Day Breaking News Archive</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-all"><Settings2 className="size-5 text-zinc-400" /></button>
          <button onClick={() => fetchNews(activeTab)} className="p-2 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-all"><RefreshCw className={`size-5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setActiveTab("ALL")} className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ALL' ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'border-zinc-800 text-zinc-500'}`}>전체 속보</button>
        <button onClick={() => setActiveTab("BOOKMARKS")} className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'BOOKMARKS' ? 'bg-yellow-500 border-yellow-500 text-zinc-950 shadow-lg' : 'border-zinc-800 text-yellow-500'}`}>
          <Star className="size-4" fill={activeTab === "BOOKMARKS" ? "currentColor" : "none"} />
          저장됨 ({bookmarks.length})
        </button>
        {keywords.map(kw => (
          <button key={kw} onClick={() => setActiveTab(kw)} className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${activeTab === kw ? 'bg-zinc-100 border-white text-zinc-950 shadow-lg' : 'border-zinc-800 text-zinc-500'}`}>{kw}</button>
        ))}
      </div>

      <div className="space-y-6 pb-32">
        {isLoading && activeTab !== "BOOKMARKS" ? (
          <div className="text-center py-32 animate-pulse font-bold text-zinc-600 tracking-widest text-xs uppercase font-sans">Filtering Breaking News...</div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-zinc-900 rounded-[40px] px-10 italic text-zinc-600">No updates found for "{activeTab}".</div>
        ) : (
          currentList.map((item: any, i: number) => {
            const isBookmarked = bookmarks.some(b => b.url === item.url)
            return (
              <div key={i} className="bg-zinc-900/30 border border-zinc-800 p-7 rounded-[32px] hover:border-zinc-600 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-orange-500 font-black bg-orange-500/10 px-2.5 py-1.5 rounded-full font-sans tracking-widest">News Feed</span>
                  <button onClick={() => toggleBookmark(item)} className={`transition-all hover:scale-125 ${isBookmarked ? 'text-yellow-500' : 'text-zinc-700 hover:text-zinc-400'}`}>
                    <Star className="size-5" fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>
                
                {/* 제목 */}
                <h3 className="text-xl font-bold leading-snug mb-2 group-hover:text-white transition-colors tracking-tight">{item.title}</h3>
                
                {/* 날짜/시간 (제목 바로 아래 배치) */}
                <div className="flex items-center gap-1.5 text-zinc-500 mb-6">
                  <Calendar className="size-3 text-zinc-600" />
                  <span className="text-[11px] font-bold font-sans tracking-tight">{item.timestamp}</span>
                </div>

                <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-orange-500 transition-colors uppercase tracking-widest font-sans">View Source <ExternalLink className="size-3" /></a>
              </div>
            )
          })
        )}
      </div>

      {/* 설정 모달 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-[48px] w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-10 text-white">
              <h3 className="text-3xl font-black italic">Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-3 hover:bg-zinc-900 rounded-full"><X className="size-6" /></button>
            </div>
            <div className="flex gap-3 mb-10">
              <input type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (newKeyword && !keywords.includes(newKeyword) && setKeywords([...keywords, newKeyword], setNewKeyword("")))} placeholder="키워드 추가..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:border-orange-500 outline-none font-bold" />
              <button onClick={() => { if(newKeyword && !keywords.includes(newKeyword)) { setKeywords([...keywords, newKeyword]); setNewKeyword(""); } }} className="bg-orange-500 hover:bg-orange-600 px-6 rounded-2xl font-black transition-all active:scale-90 text-white"><Plus /></button>
            </div>
            <div className="flex flex-wrap gap-2.5 max-h-64 overflow-y-auto pr-2 scrollbar-hide text-white">
              {keywords.map(kw => (
                <div key={kw} className="bg-zinc-900 border border-zinc-800 px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-4">
                  {kw} <X className="size-4 cursor-pointer text-zinc-600 hover:text-red-500 transition-colors" onClick={() => setKeywords(keywords.filter(k => k !== kw))} />
                </div>
              ))}
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-10 bg-white text-zinc-950 py-5 rounded-[24px] font-black text-lg hover:bg-orange-500 transition-all active:scale-95">DONE</button>
          </div>
        </div>
      )}
    </div>
  )
}
