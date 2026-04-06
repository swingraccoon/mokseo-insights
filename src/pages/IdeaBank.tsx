import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink as ExternalLinkIcon, Plus as PlusIcon, Trash2, Link as LinkIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface IdeaItem {
  id: string
  url: string
  title: string
  note: string
  source: string
  created_at: string
}

export function IdeaBank() {
  const [ideas, setIdeas] = useState<IdeaItem[]>([])
  const [urlInput, setUrlInput] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTitle, setCurrentTitle] = useState("")
  const [currentNote, setCurrentNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const loadIdeas = async () => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/idea_bank?select=*&order=created_at.desc`, {
      headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }
    })
    if (response.ok) setIdeas(await response.json())
  }

  useEffect(() => { loadIdeas() }, [])

  const handleUrlPaste = async () => {
    if (!urlInput.trim()) return
    setIsLoading(true)
    // 자동 제목 추출 시도 (서버 프록시가 없는 경우 도메인 추출)
    try {
      const domain = new URL(urlInput).hostname.replace("www.", "")
      setCurrentTitle(`${domain}의 새로운 아이디어`)
    } catch {
      setCurrentTitle("제목 없음")
    }
    setIsDialogOpen(true)
    setIsLoading(false)
  }

  const handleSave = async () => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/idea_bank`, {
      method: "POST",
      headers: { 
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, 
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: urlInput, title: currentTitle, note: currentNote, source: urlInput.includes("x.com") ? "X" : "Web" })
    })
    if (response.ok) { setUrlInput(""); setIsDialogOpen(false); loadIdeas() }
  }

  const deleteIdea = async (id: string) => {
    if (!confirm("이 아이디어를 삭제할까요?")) return
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/idea_bank?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }
    })
    loadIdeas()
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 text-orange-500">YouTube Idea Bank</h2>
      <Card className="bg-zinc-900 border-zinc-800 mb-8">
        <CardContent className="p-4 flex gap-2">
          <Input 
            placeholder="아이디어 링크를 붙여넣으세요 (X, 텔레그램, 웹...)" 
            value={urlInput} 
            onChange={(e) => setUrlInput(e.target.value)}
            className="bg-zinc-950 border-zinc-800"
          />
          <Button onClick={handleUrlPaste} className="bg-orange-500 hover:bg-orange-600"><PlusIcon /></Button>
        </CardContent>
      </Card>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4">
          {ideas.map((idea) => (
            <Card key={idea.id} className="bg-zinc-900 border-zinc-800 group">
              <CardContent className="p-5">
                <div className="flex justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">{idea.source}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => deleteIdea(idea.id)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 transition-all">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <h3 className="text-lg font-semibold mb-2">{idea.title}</h3>
                {idea.note && <p className="text-sm text-zinc-400 mb-4 bg-zinc-950 p-3 rounded">{idea.note}</p>}
                <a href={idea.url} target="_blank" className="text-xs text-orange-500 flex items-center gap-1 hover:underline">
                  <LinkIcon className="size-3" /> 원문 링크 가기
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-950 text-white border-zinc-800">
          <DialogHeader><DialogTitle>아이디어 저장</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="제목" value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} className="bg-zinc-900 border-zinc-800" />
            <Textarea placeholder="간단한 메모를 남겨주세요..." value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} className="bg-zinc-900 border-zinc-800" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
            <Button onClick={handleSave} className="bg-orange-500">저장하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
