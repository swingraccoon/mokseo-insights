import React from "react"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pb-20">
      {children}
    </div>
  )
}
