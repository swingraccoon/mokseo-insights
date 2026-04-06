import { useState, useEffect } from "react"
import { ExternalLink, RefreshCw, Settings2, Plus, X } from "lucide-react"

export function NewsFilter() {
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 사용자 정의 키워드 관리 (localStorage 저장)
  const [keywords, setKeywords] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("news-keywords")
      return saved ? JSON.parse(saved) : ["비트코인", "BTC", "이더리움", "ETH", "솔라나", "리플"]
    }
    return ["비트코인", "BTC", "이더리움", "ETH", "솔라나", "리플"]
  })
  
  const [newKeyword, setNewKeyword] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 1. 진짜 뉴스 배달부(/api/news)에게 데이터 요청하는 함수
  const fetchNews = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/news') // 우리가 만든 배달부 호출
      if (!response.ok) throw new Error("뉴스를 가져오지 못했습니다.")
      const data = await response.json()
      setNews(data.news || [])
    } catch (err) {
      setError("실시간 뉴스를 불러오는데 실패했습니다.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // 첫 로딩 시 뉴스 가져오기
  useEffect(() => {
    fetchNews()
  }, [])

  // 키워드가 바뀔 때마다 저장
  useEffect(() => {
    localStorage.setItem("news-keywords", JSON.stringify(keywords))
  }, [keywords])

  // 키워드 필터링 로직
  const filteredNews = activeTab === "ALL" 
    ? news 
    : news.filter((item: any) => 
        item.title.toLowerCase().includes(activeTab.toLowerCase())
      )

  const addKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword])
      setNewKeyword("")
    }
  }

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw))
    if (activeTab === kw) setActiveTab("ALL")
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 text-zinc-100">
      {/* 헤더 섹션 */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-orange-500 mb-1 italic">Mokseo Insights</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Coinness Real-time Feed</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="p-2 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors"
          >
            <Settings2 className="size-5 text-zinc-400" />
          </button>
          <button 
            onClick={fetchNews} 
            disabled={isLoading}
            className="p-2 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 키워드 탭 리스트 */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab("ALL")}
          className={`px-5 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ALL' ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
        >전체</button>
        {keywords.map(kw => (
          <button 
            key={kw}
            onClick={() => setActiveTab(kw)}
            className={`px-5 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${activeTab === kw ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
          >{kw}</button>
        ))}
      </div>

      {/* 뉴스 리스트 섹션 */}
      <div className="space-y-4 pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-medium">최신 속보를 가져오고 있습니다...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 border border-red-500/20 rounded-2xl bg-red-500/5">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchNews} className="text-sm bg-zinc-800 px-4 py-2 rounded-lg">다시 시도</button>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-20 text-zinc-600 border border-zinc-900 rounded-2xl border-dashed">
            해당 키워드에 맞는 뉴스가 없습니다.
          </div>
        ) : (
          filteredNews.map((item: any, i: number) => (
            <div 
              key={i} 
              className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/40 transition-all group active:scale-[0.98]"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-widest text-orange-500 font-black bg-orange-500/10 px-2 py-1 rounded">Flash News</span>
                <span className="text-xs text-zinc-600 font-medium">{item.timestamp}</span>
              </div>
              <h3 className="text-lg font-semibold leading-relaxed mb-5 group-hover:text-white transition-colors">
                {item.title}
              </h3>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-zinc-500 hover:text-orange-500 flex items-center gap-1 transition-colors"
              >
                원문 보기 <ExternalLink className="size-3" />
              </a>
            </div>
          ))
        )}
      </div>

      {/* 키워드 설정 모달 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">키워드 관리</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-zinc-900 rounded-full"><X /></button>
            </div>
            
            <div className="flex gap-2 mb-8">
              <input 
                type="text" 
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="추가할 키워드..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all"
              />
              <button 
                onClick={addKeyword}
                className="bg-orange-500 hover:bg-orange-600 px-5 rounded-xl font-bold transition-colors"
              ><Plus className="size-6" /></button>
            </div>

            <p className="text-xs text-zinc-500 mb-4 font-bold uppercase tracking-tighter">현재 등록된 키워드</p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {keywords.map(kw => (
                <div key={kw} className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-3">
                  {kw} 
                  <X 
                    className="size-4 cursor-pointer text-zinc-600 hover:text-red-500 transition-colors" 
                    onClick={() => removeKeyword(kw)} 
                  />
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="w-full mt-8 bg-zinc-100 text-zinc-950 py-3 rounded-xl font-bold hover:bg-white transition-colors"
            >설정 완료</button>
          </div>
        </div>
      )}
    </div>
  )
}
