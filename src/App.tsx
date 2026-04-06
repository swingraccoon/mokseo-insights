import { useState } from "react"

import { Layout } from "@/components/Layout"

import { BottomNav } from "@/components/BottomNav"

import { NewsFilter } from "@/pages/NewsFilter"

import { IdeaBank } from "@/pages/IdeaBank"



export function App() {

  const [currentPage, setCurrentPage] = useState<"news" | "ideas">("news")



  return (

    <Layout>

      {currentPage === "news" ? <NewsFilter /> : <IdeaBank />}

      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />

    </Layout>

  )

}



export default App
