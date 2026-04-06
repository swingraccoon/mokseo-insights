import { Newspaper, Lightbulb } from "lucide-react"

interface BottomNavProps {
  currentPage: "news" | "ideas"
  onPageChange: (page: "news" | "ideas") => void
}

export function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-lg pb-safe">
      <div className="flex h-16 items-center justify-around">
        <button
          onClick={() => onPageChange("news")}
          className={`flex flex-col items-center gap-1 ${currentPage === "news" ? "text-orange-500" : "text-zinc-500"}`}
        >
          <Newspaper className="size-5" />
          <span className="text-[10px] font-medium">News</span>
        </button>
        <button
          onClick={() => onPageChange("ideas")}
          className={`flex flex-col items-center gap-1 ${currentPage === "ideas" ? "text-orange-500" : "text-zinc-500"}`}
        >
          <Lightbulb className="size-5" />
          <span className="text-[10px] font-medium">Ideas</span>
        </button>
      </div>
    </div>
  )
}
