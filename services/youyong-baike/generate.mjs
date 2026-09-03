import 'dotenv/config'
import { initDb, insertArticle, getRecentTopics } from './db.mjs'
import { pickNextCategory, buildSystemPrompt, buildUserPrompt } from './prompt.mjs'

function parseArgs(argv) {
  let count = 1
  for (const a of argv) {
    if (a.startsWith('--count=')) count = Math.max(1, Number(a.slice(8)) || 1)
  }
  return { count }
}

function slugify(title) {
  const base = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'article'
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `${base}-${day}-${Math.random().toString(36).slice(2, 6)}`
}

function extractJson(text) {
  const trimmed = text.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fence ? fence[1] : trimmed
  return JSON.parse(raw)
}

async function callDeepSeek({ system, user }) {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) throw new Error('缺少 DEEPSEEK_API_KEY')
  const base = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '')
  const res = await fetch(`${base}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`DeepSeek HTTP ${res.status}: ${t.slice(0, 500)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function validateArticle(obj, expectedCategory) {
  if (!obj?.title || !obj?.summary || !obj?.body_md) throw new Error('缺必填字段')
  if (!Array.isArray(obj.sources)) throw new Error('sources 必须是数组')
  const len = String(obj.body_md).replace(/\s/g, '').length
  if (len < 800 || len > 3500) throw new Error(`字数异常: ${len}`)
  if (!/```mermaid[\s\S]*?```/i.test(String(obj.body_md))) {
    throw new Error('正文缺少 Mermaid 示意图')
  }
  const sources = obj.sources.map((s) => ({
    title: String(s.title || s.url || '来源'),
    url: String(s.url || '')
  })).filter((s) => s.url)
  if (sources.length < 1) throw new Error('至少需要1个来源链接')
  return {
    title: String(obj.title).trim(),
    summary: String(obj.summary).trim(),
    category: expectedCategory,
    body_md: String(obj.body_md).trim(),
    sources
  }
}

async function generateOne(db) {
  const recent = getRecentTopics(db, 30)
  const category = pickNextCategory(recent.map((r) => r.category))
  let lastErr
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const content = await callDeepSeek({
        system: buildSystemPrompt(),
        user: buildUserPrompt({ category, recentTopics: recent })
      })
      const parsed = extractJson(content)
      const article = validateArticle(parsed, category)
      const slug = slugify(article.title)
      insertArticle(db, { ...article, slug })
      console.log(`[ok] ${category} | ${slug} | ${article.title}`)
      return
    } catch (e) {
      lastErr = e
      console.error(`[retry ${attempt}]`, e.message || e)
    }
  }
  throw lastErr
}

const { count } = parseArgs(process.argv.slice(2))
const db = initDb()
let ok = 0
let failed = 0
for (let i = 0; i < count; i++) {
  console.log(`--- generating ${i + 1}/${count} ---`)
  try {
    await generateOne(db)
    ok++
  } catch (e) {
    failed++
    console.error(`[fail ${i + 1}/${count}]`, e.message || e)
  }
}
db.close()
console.log(`[done] ok=${ok} failed=${failed}`)
if (failed > 0 && (count === 1 || failed === count)) {
  process.exit(1)
}
