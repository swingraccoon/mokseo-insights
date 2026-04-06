import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite" // 이 줄이 디자인 엔진입니다
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()], // 여기에 tailwindcss()를 추가했습니다
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
