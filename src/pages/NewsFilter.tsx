import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink as ExternalLinkIcon, RefreshCw as RefreshIcon, Settings2 as SettingsIcon, Plus, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface NewsItem {
  id: string
  title: string
  url: string
  timestamp: string
  originalCoin: string
}

export function NewsFilter() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // 사용자 정의 키워드 관리 (기본값 설정)
  const [keywords, setKeywords] = useState<string[]>(() => {
    const saved = localStorage.getItem("news-keywords")
    return saved ? JSON.parse(saved) : ["비트코인", "BTC", "이더리움", "ETH", "솔라나", "리플"]
  })
  const [newKeyword, setNewKeyword] = useState("")
  const [activeTab, setActiveTab] = useState<string>("ALL")

  useEffect(() => {
    localStorage.setItem("news-keywords", JSON.stringify(keywords))
  }, [keywords])

  const fetchNews = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-news`)
      if (!response.ok) throw new Error(`뉴스 데이터를 가져오는데 실패했습니다.`)
      const data = await response.json()
      
      const formattedNews: NewsItem[] = data.news.map((item: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        title: item.title,
        url: item.url,
        timestamp: item.timestamp,
        originalCoin: item.coin
      }))

      setNews(formattedNews)
      setLastUpdated(new Date())
    } catch (err) {
      setError("실시간 뉴스를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])

  // 키워드 필터링 로직
  const filteredNews = activeTab === "ALL" 
    ? news 
    : news.filter(item => item.title.toLowerCase().includes(activeTab.toLowerCase()))

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
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-orange-500">Mokseo Insights</h2>
          <p className="text-sm text-muted-foreground">
            코인니스 실시간 속보 {lastUpdated && `(${lastUpdated.toLocaleTimeString()})`}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SettingsIcon className="size-4" /> 키워드 설정
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 text-white border-zinc-800">
              <DialogHeader>
                <DialogTitle>관심 키워드 관리</DialogTitle>
              </DialogHeader>
              <div className="flex gap-2 my-4">
                <Input 
                  value={newKeyword} 
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="추가할 키워드 (예: 리플)"
                  className="bg-zinc-900 border-zinc-800"
                />
                <Button onClick={addKeyword} className="bg-orange-500 hover:bg-orange-600"><Plus className="size-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map(kw => (
                  <Badge key={kw} variant="secondary" className="gap-1 py-1 px-2">
                    {kw} <X className="size-3 cursor-pointer" onClick={() => removeKeyword(kw)} />
                  </Badge>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={fetchNews} disabled={isLoading} size="sm" variant="outline" className="gap-2">
            <RefreshIcon className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full pb-2">
          <TabsList className="bg-zinc-900 border-zinc-800">
            <TabsTrigger value="ALL">전체</TabsTrigger>
            {keywords.map(kw => (
              <TabsTrigger key={kw} value={kw}>{kw}</TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-3"><Spinner /><p className="text-zinc-500">뉴스를 분석 중입니다...</p></div>
          ) : filteredNews.map((item) => (
            <Card key={item.id} className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition-all">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className="text-orange-500 border-orange-500/30">News</Badge>
                  <span className="text-xs text-zinc-500">{item.timestamp}</span>
                </div>
                <h3 className="text-lg font-medium leading-relaxed mb-4">{item.title}</h3>
                <a href={item.url} target="_blank" className="text-sm text-zinc-400 hover:text-white flex items-center gap-1">
                  원문 보기 <ExternalLinkIcon className="size-3" />
                </a>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
