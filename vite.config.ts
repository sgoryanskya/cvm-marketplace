import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // проект плоский: картинки и шрифты лежат рядом с кодом и подключаются импортом
  publicDir: false,
  server: { port: 5173, host: true },
})
