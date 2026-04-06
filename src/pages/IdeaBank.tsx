import { useState, useEffect } from "react"
import { Plus, Trash2, Link as LinkIcon, ExternalLink, Lightbulb } from "lucide-react"

export function IdeaBank() {
  const [ideas, setIdeas] = useState([])
  const [urlInput, setUrlInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const loadIdeas = async () => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/idea_bank?select=*&order=created_at.desc`, {
      headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }
    })
    if (response.ok) setIdeas(await response.json())
  }

  useEffect(() => { loadIdeas() }, [])

  const handleSave = async () => {
    if (!urlInput) return
    setIsLoading(true)
    const domain = new URL(urlInput).hostname.replace("www.", "")
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/idea_bank`, {
      method: "POST",
      headers: { 
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, 
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: urlInput, title: `${domain} 소식`, source: urlInput.includes("x.com") ? "X" : "Web" })
    })
    setUrlInput(""); loadIdeas(); setIsLoading(false)
  }

  const deleteIdea = async (id: string) => {
    if (!confirm("삭제할까요?")) return
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/idea_bank?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }
    })
    loadIdeas()
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 text-zinc-100">
      <h2 className="text-3xl font-bold mb-6 text-orange-500 flex items-center gap-2">
        <Lightbulb /> Idea Bank
      </h2>
      
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-8 flex gap-2">
        <input 
          placeholder="X, 텔레그램 링크를 붙여넣으세요" 
          value={urlInput} 
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-colors"
        />
        <button onClick={handleSave} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 px-6 rounded-xl font-bold transition-colors">
          {isLoading ? "..." : <Plus />}
        </button>
      </div>

      <div className="space-y-4 pb-20">
        {ideas.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">아직 저장된 아이디어가 없습니다.</div>
        ) : ideas.map((idea: any) => (
          <div key={idea.id} className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-2xl group hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold bg-zinc-800 px-2 py-1 rounded text-zinc-400 uppercase tracking-tighter">{idea.source}</span>
              <button onClick={() => deleteIdea(idea.id)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="size-4" />
              </button>
            </div>
            <h3 className="text-lg font-medium mb-4">{idea.title}</h3>
            <a href={idea.url} target="_blank" className="text-xs text-orange-500 hover:underline flex items-center gap-1">
              링크 바로가기 <ExternalLink className="size-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
