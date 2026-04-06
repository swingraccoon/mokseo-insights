import { useState, useEffect } from "react"
import { ExternalLink, RefreshCw, Settings2, Plus, X, Search } from "lucide-react"

export function NewsFilter() {
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [keywords, setKeywords] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("news-keywords") : null
    return saved ? JSON.parse(saved) : ["비트코인", "BTC", "이더리움", "ETH", "솔라나", "리플"]
  })
  const [newKeyword, setNewKeyword] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const fetchNews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-news`)
      const data = await response.json()
      setNews(data.news || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])
  useEffect(() => { localStorage.setItem("news-keywords", JSON.stringify(keywords)) }, [keywords])

  const filteredNews = activeTab === "ALL" 
    ? news 
    : news.filter((item: any) => item.title.includes(activeTab))

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 text-zinc-100">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-orange-500 mb-1">Mokseo Insights</h2>
          <p className="text-sm text-zinc-500">코인니스 실시간 속보</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors">
            <Settings2 className="size-5 text-zinc-400" />
          </button>
          <button onClick={fetchNews} className="p-2 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors">
            <RefreshCw className={`size-5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 키워드 탭 */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab("ALL")}
          className={`px-5 py-2 rounded-full border text-sm font-medium transition-all ${activeTab === 'ALL' ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
        >전체</button>
        {keywords.map(kw => (
          <button 
            key={kw}
            onClick={() => setActiveTab(kw)}
            className={`px-5 py-2 rounded-full border text-sm font-medium transition-all ${activeTab === kw ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
          >{kw}</button>
        ))}
      </div>

      {/* 뉴스 리스트 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-zinc-500 animate-pulse">뉴스를 분석 중입니다...</div>
        ) : filteredNews.map((item: any, i: number) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl hover:border-orange-500/50 transition-all group">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase tracking-widest text-orange-500 font-bold bg-orange-500/10 px-2 py-1 rounded">Flash News</span>
              <span className="text-xs text-zinc-600">{item.timestamp}</span>
            </div>
            <h3 className="text-lg font-medium leading-relaxed mb-4 group-hover:text-white transition-colors">{item.title}</h3>
            <a href={item.url} target="_blank" className="text-xs text-zinc-500 hover:text-orange-500 flex items-center gap-1">
              원문 보기 <ExternalLink className="size-3" />
            </a>
          </div>
        ))}
      </div>

      {/* 설정 모달 (간이 구현) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">키워드 설정</h3>
              <button onClick={() => setIsSettingsOpen(false)}><X /></button>
            </div>
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="키워드 추가..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2"
              />
              <button 
                onClick={() => { if(newKeyword) { setKeywords([...keywords, newKeyword]); setNewKeyword(""); } }}
                className="bg-orange-500 px-4 py-2 rounded-lg"
              ><Plus /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map(kw => (
                <div key={kw} className="bg-zinc-900 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {kw} <X className="size-3 cursor-pointer text-zinc-500" onClick={() => setKeywords(keywords.filter(k => k !== kw))} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
