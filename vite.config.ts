import { readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// сборка кладется в корень репозитория: его раздает GitHub Pages
const SITE = resolve(__dirname, '..')

// knowledge.json лежит в корне рядом со сборкой и не пересобирается:
// ссылки плашек правят прямо в GitHub. Локально сервер отдает тот же файл
const knowledge: Plugin = {
  name: 'knowledge-json',
  configureServer(server) {
    server.middlewares.use('/knowledge.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache')
      res.end(readFileSync(resolve(SITE, 'knowledge.json')))
    })
  },
}

// перед сборкой убираем прошлые бандлы, чтобы в корне не копились лишние файлы
const cleanAssets: Plugin = {
  name: 'clean-assets',
  apply: 'build',
  buildStart() {
    rmSync(resolve(SITE, 'assets'), { recursive: true, force: true })
  },
}

export default defineConfig({
  plugins: [react(), knowledge, cleanAssets],
  base: './',
  // проект плоский: картинки и шрифты лежат рядом с кодом и подключаются импортом
  publicDir: false,
  build: {
    outDir: SITE,
    // корень не чистим целиком: там исходники, knowledge.json и README
    emptyOutDir: false,
    assetsDir: 'assets',
  },
  server: { port: 5173, host: true },
})
