import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDb, listArticles, getArticleBySlug } from './db.mjs'

const PORT = Number(process.env.PORT || 8790)
const db = initDb()
const app = express()

app.use(cors({
  origin: [
    'https://vansiit.cc',
    'https://www.vansiit.cc',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ]
}))

app.get('/wiki-api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/wiki-api/articles', (req, res) => {
  const page = Number(req.query.page || 1)
  const pageSize = Number(req.query.pageSize || 20)
  res.json(listArticles(db, { page, pageSize }))
})

app.get('/wiki-api/articles/:slug', (req, res) => {
  const article = getArticleBySlug(db, req.params.slug)
  if (!article) {
    res.status(404).json({ error: 'not_found' })
    return
  }
  res.json(article)
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`youyong-baike listening on 127.0.0.1:${PORT}`)
})
