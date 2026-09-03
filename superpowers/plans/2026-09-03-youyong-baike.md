# 有用百科 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为博客增加「有用百科」板块：独立 Express+SQLite API、DeepSeek 日更生成脚本，以及 VitePress 列表/详情页。

**Architecture:** 仓库内 `services/youyong-baike/` 提供只读 API 与 `generate.mjs`；部署到 `124.223.42.161:/opt/youyong-baike`，Nginx 反代 `https://vansiit.site/wiki-api`；前端 ClientOnly 组件拉取 API 渲染。

**Tech Stack:** Node 20+、Express、better-sqlite3、DeepSeek OpenAI 兼容 API、VitePress/Vue 3、markdown-it、DOMPurify、pm2、cron

## Global Constraints

- 板块名：有用百科；路由：`/youyong`、`/youyong/detail?slug=`
- API 前缀：`https://vansiit.site/wiki-api` → 本机 `:8790`
- 密钥只放服务器 `.env`，禁止提交 Git；聊天中的密码/Key 不得写入仓库文件
- 列表无分类筛选；主色 `#0085a1`；中文注释与 commit
- 规格依据：`superpowers/specs/2026-09-03-youyong-baike-design.md`

---

## File Structure

```
services/youyong-baike/
  package.json
  .env.example
  .gitignore
  db.mjs                 # SQLite 初始化与查询/写入
  server.mjs             # Express 只读 API
  prompt.mjs             # 系统提示词与轮换分类
  generate.mjs           # DeepSeek 生成并入库
  ecosystem.config.cjs   # pm2
  nginx-wiki-api.conf    # Nginx 片段说明

docs/youyong.md
docs/youyong/detail.md
docs/.vitepress/theme/api/youyongApi.ts
docs/.vitepress/theme/components/YouyongList.vue
docs/.vitepress/theme/components/YouyongDetail.vue
docs/.vitepress/theme/index.ts          # 注册组件
docs/.vitepress/config.mts              # nav + 开发代理
docs/index.md                           # features 入口
```

---

### Task 1: 后端脚手架与数据库层

**Files:**
- Create: `services/youyong-baike/package.json`
- Create: `services/youyong-baike/.gitignore`
- Create: `services/youyong-baike/.env.example`
- Create: `services/youyong-baike/db.mjs`
- Test: 用 `node --test` 内联验证（见步骤）

**Interfaces:**
- Produces:
  - `initDb(dbPath?: string): Database`
  - `listArticles(db, { page, pageSize }): { total, list }`
  - `getArticleBySlug(db, slug): article | null`（含 `prev_slug`/`next_slug`）
  - `insertArticle(db, row): void`
  - `getRecentTopics(db, days=30): { title, summary, category }[]`
  - `CATEGORIES` 由 `prompt.mjs` 提供；本任务先在 `db.mjs` 不依赖 prompt

- [ ] **Step 1: 创建目录与 package.json**

```json
{
  "name": "youyong-baike",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node server.mjs",
    "generate": "node generate.mjs",
    "test": "node --test test/*.test.mjs"
  },
  "dependencies": {
    "better-sqlite3": "^11.7.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2"
  }
}
```

`.gitignore`:

```
node_modules/
data/
logs/
.env
*.db
```

`.env.example`:

```
PORT=8790
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DB_PATH=./data/youyong.db
```

- [ ] **Step 2: 实现 `db.mjs`**

```js
import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

export function initDb(dbPath = process.env.DB_PATH || './data/youyong.db') {
  fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true })
  const db = new Database(dbPath)
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      category TEXT NOT NULL,
      body_md TEXT NOT NULL,
      sources TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);
  `)
  return db
}

export function listArticles(db, { page = 1, pageSize = 20 } = {}) {
  const size = Math.min(Math.max(Number(pageSize) || 20, 1), 50)
  const p = Math.max(Number(page) || 1, 1)
  const total = db.prepare('SELECT COUNT(*) AS c FROM articles').get().c
  const list = db.prepare(`
    SELECT id, slug, title, summary, category, created_at
    FROM articles ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
  `).all(size, (p - 1) * size)
  return { total, list }
}

export function getArticleBySlug(db, slug) {
  const row = db.prepare('SELECT * FROM articles WHERE slug = ?').get(slug)
  if (!row) return null
  const prev = db.prepare(`
    SELECT slug FROM articles
    WHERE created_at < ? OR (created_at = ? AND id < ?)
    ORDER BY created_at DESC, id DESC LIMIT 1
  `).get(row.created_at, row.created_at, row.id)
  const next = db.prepare(`
    SELECT slug FROM articles
    WHERE created_at > ? OR (created_at = ? AND id > ?)
    ORDER BY created_at ASC, id ASC LIMIT 1
  `).get(row.created_at, row.created_at, row.id)
  return {
    ...row,
    sources: JSON.parse(row.sources || '[]'),
    prev_slug: prev?.slug ?? null,
    next_slug: next?.slug ?? null
  }
}

export function insertArticle(db, {
  slug, title, summary, category, body_md, sources, created_at
}) {
  db.prepare(`
    INSERT INTO articles (slug, title, summary, category, body_md, sources, created_at)
    VALUES (@slug, @title, @summary, @category, @body_md, @sources, @created_at)
  `).run({
    slug,
    title,
    summary,
    category,
    body_md,
    sources: typeof sources === 'string' ? sources : JSON.stringify(sources ?? []),
    created_at: created_at || new Date().toISOString()
  })
}

export function getRecentTopics(db, days = 30) {
  const since = new Date(Date.now() - days * 86400000).toISOString()
  return db.prepare(`
    SELECT title, summary, category FROM articles
    WHERE created_at >= ? ORDER BY created_at DESC
  `).all(since)
}
```

- [ ] **Step 3: 写测试并安装依赖跑通**

创建 `services/youyong-baike/test/db.test.mjs`：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { initDb, insertArticle, listArticles, getArticleBySlug } from '../db.mjs'

test('insert list get with prev next', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-'))
  const db = initDb(path.join(dir, 't.db'))
  insertArticle(db, {
    slug: 'a1', title: 'T1', summary: 'S1', category: '自然科学',
    body_md: 'body1', sources: [], created_at: '2026-09-01T00:00:00.000Z'
  })
  insertArticle(db, {
    slug: 'a2', title: 'T2', summary: 'S2', category: '历史与文明',
    body_md: 'body2', sources: [{ title: 'x', url: 'https://example.com' }],
    created_at: '2026-09-02T00:00:00.000Z'
  })
  const { total, list } = listArticles(db, { page: 1, pageSize: 10 })
  assert.equal(total, 2)
  assert.equal(list[0].slug, 'a2')
  const a1 = getArticleBySlug(db, 'a1')
  assert.equal(a1.next_slug, 'a2')
  assert.equal(a1.prev_slug, null)
  db.close()
})
```

Run:

```bash
cd services/youyong-baike
npm install
npm test
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add services/youyong-baike
git commit -m "feat(youyong): 添加有用百科 SQLite 数据层"
```

---

### Task 2: Express 只读 API

**Files:**
- Create: `services/youyong-baike/server.mjs`
- Modify: `docs/.vitepress/config.mts`（开发代理，可本任务末尾或 Task 4 做）

**Interfaces:**
- Consumes: `initDb`, `listArticles`, `getArticleBySlug`
- Produces: HTTP
  - `GET /wiki-api/articles?page&pageSize`
  - `GET /wiki-api/articles/:slug`
  - `GET /wiki-api/health`

- [ ] **Step 1: 实现 `server.mjs`**

```js
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
```

- [ ] **Step 2: 手动冒烟**

另开终端：

```bash
cd services/youyong-baike
node -e "import {initDb,insertArticle} from './db.mjs'; const db=initDb(); insertArticle(db,{slug:'smoke',title:'冒烟',summary:'测',category:'自然科学',body_md:'# hi',sources:[]});"
node server.mjs
```

```bash
curl -s http://127.0.0.1:8790/wiki-api/health
curl -s "http://127.0.0.1:8790/wiki-api/articles?page=1"
curl -s http://127.0.0.1:8790/wiki-api/articles/smoke
```

Expected: health `ok`；list 含 smoke；详情含 `body_md`

- [ ] **Step 3: Commit**

```bash
git add services/youyong-baike/server.mjs
git commit -m "feat(youyong): 添加有用百科只读 Express API"
```

---

### Task 3: 生成脚本（DeepSeek + prompt）

**Files:**
- Create: `services/youyong-baike/prompt.mjs`
- Create: `services/youyong-baike/generate.mjs`

**Interfaces:**
- Consumes: `initDb`, `insertArticle`, `getRecentTopics`, `DEEPSEEK_API_KEY`
- Produces: CLI `node generate.mjs --count=N`

- [ ] **Step 1: 实现 `prompt.mjs`**

```js
export const CATEGORIES = [
  '自然科学',
  '技术与工程',
  '经济与商业',
  '历史与文明',
  '地理与社会',
  '哲学与心理',
  '艺术与文化'
]

export function pickNextCategory(recentCategories) {
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0]))
  for (const c of recentCategories) {
    if (counts[c] != null) counts[c] += 1
  }
  return CATEGORIES.slice().sort((a, b) => counts[a] - counts[b])[0]
}

export function buildSystemPrompt() {
  return `你是「有用百科」的知识写作者。每天写一条中文跨学科知识，目标是持续拓展知识边界，并形成可长期积累的知识体系。

选题在自然科学、技术与工程、经济与商业、历史与文明、地理与社会、哲学与心理、艺术与文化之间轮换。
优先选择具有解释力、能够连接现实世界的核心概念、机制或历史规律，避免鸡汤、猎奇冷知识和过度基础的百科常识。
结合读者背景：35 多岁的全栈开发+互联网从业人员+创业中，对代码开发、AI、数码产品、商业和产业研究已有一定基础。
相关领域可以适当深入，同时确保至少一半选题来自其平时较少接触的领域。

每次只讲一个主题，控制在 1000 至 2000 字。先用一个有吸引力的标题和一句话给出核心结论，随后用连贯、易懂的中文说明：
1. 它是什么；
2. 它为什么成立或如何运作；
3. 一个具体、可信的现实案例；
4. 它与日常判断、商业决策或理解世界的联系；
5. 最后给出一个帮助记忆的思考题，并在文末附上简短答案。

避免重复过去 30 天讲过的主题；如果新主题与旧知识有关，明确指出两者的联系。表达清晰、有深度，少用术语，必要术语必须解释。不要把内容写成新闻简报，也不要堆砌条目。

事实准确优先。涉及可能变化的数据、当代事件或有争议的结论时，注明信息截至日期，并附可靠来源链接；常青知识至少附 1 个权威来源。明确区分公认事实、主流解释与推论。若无法可靠核实，改选其他主题。

你必须只输出一个 JSON 对象（不要 markdown 围栏），字段：
{
  "title": string,
  "summary": string,
  "category": string,
  "body_md": string,
  "sources": [{"title": string, "url": string}]
}
body_md 为完整正文 Markdown（含思考题与答案），不要重复 title/summary 作为单独字段内容以外的硬性要求外，标题可在正文中再现。`
}

export function buildUserPrompt({ category, recentTopics }) {
  const recent = recentTopics.length
    ? recentTopics.map((t, i) => `${i + 1}. [${t.category}] ${t.title} — ${t.summary}`).join('\n')
    : '（暂无历史主题）'
  return `本次指定分类：${category}

过去 30 天已讲主题（请避免重复）：
${recent}

请生成一条新知识，category 必须是「${category}」。`
}
```

- [ ] **Step 2: 实现 `generate.mjs`**

```js
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
  return {
    title: String(obj.title).trim(),
    summary: String(obj.summary).trim(),
    category: expectedCategory,
    body_md: String(obj.body_md).trim(),
    sources: obj.sources.map((s) => ({
      title: String(s.title || s.url || '来源'),
      url: String(s.url || '')
    })).filter((s) => s.url)
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
for (let i = 0; i < count; i++) {
  console.log(`--- generating ${i + 1}/${count} ---`)
  await generateOne(db)
}
db.close()
```

- [ ] **Step 3: 本地用真实 Key 试生成 1 条（Key 只进本地 `.env`，勿 commit）**

```bash
cd services/youyong-baike
# 手动创建 .env：DEEPSEEK_API_KEY=...
node generate.mjs --count=1
```

Expected: 控制台 `[ok]`，数据库多 1 条

- [ ] **Step 4: Commit（不含 .env）**

```bash
git add services/youyong-baike/prompt.mjs services/youyong-baike/generate.mjs services/youyong-baike/.env.example
git commit -m "feat(youyong): 添加 DeepSeek 知识生成脚本"
```

---

### Task 4: 前端 API 客户端与列表页

**Files:**
- Create: `docs/.vitepress/theme/api/youyongApi.ts`
- Create: `docs/.vitepress/theme/components/YouyongList.vue`
- Create: `docs/youyong.md`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/config.mts`（nav + proxy）

**Interfaces:**
- Produces: `fetchArticleList`, `fetchArticleDetail`；组件名 `YouyongList`

- [ ] **Step 1: `youyongApi.ts`**

```ts
export const YOUYONG_API_BASE = import.meta.env.DEV
  ? '/wiki-api'
  : 'https://vansiit.site/wiki-api'

export interface YouyongListItem {
  id: number
  slug: string
  title: string
  summary: string
  category: string
  created_at: string
}

export interface YouyongArticle extends YouyongListItem {
  body_md: string
  sources: { title: string; url: string }[]
  prev_slug: string | null
  next_slug: string | null
}

export async function fetchArticleList(page = 1, pageSize = 20) {
  const res = await fetch(`${YOUYONG_API_BASE}/articles?page=${page}&pageSize=${pageSize}`)
  if (!res.ok) throw new Error(`list ${res.status}`)
  return res.json() as Promise<{ total: number; list: YouyongListItem[] }>
}

export async function fetchArticleDetail(slug: string) {
  const res = await fetch(`${YOUYONG_API_BASE}/articles/${encodeURIComponent(slug)}`)
  if (!res.ok) throw new Error(`detail ${res.status}`)
  return res.json() as Promise<YouyongArticle>
}
```

- [ ] **Step 2: 实现 `YouyongList.vue`**

要求：纸感背景、主色 `#0085a1`、时间倒序列表（日期·分类·标题·结论）、入场动效、加载更多、点击跳转 `/youyong/detail?slug=`。组件内 scoped CSS，不用卡片堆砌。注册 Google Fonts：标题用 `Source Serif 4` 或 `Noto Serif SC`，正文 `Source Sans 3` / 系统兜底——在组件 mounted 时或页面 head 注入均可，优先在 `youyong.md` frontmatter 不强制；用 CSS `@import` 引入字体。

核心逻辑骨架：

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchArticleList, type YouyongListItem } from '../api/youyongApi'

const list = ref<YouyongListItem[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const error = ref('')

async function load(reset = false) {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    if (reset) { page.value = 1; list.value = [] }
    const data = await fetchArticleList(page.value, 20)
    total.value = data.total
    list.value = reset ? data.list : list.value.concat(data.list)
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function loadMore() {
  page.value += 1
  load(false)
}

onMounted(() => load(true))
</script>
```

模板：每项 `<a :href="\`/youyong/detail?slug=${item.slug}\`">`；有 `list.length < total` 时显示「加载更多」。

- [ ] **Step 3: 页面与注册**

`docs/youyong.md`：

```md
---
title: 有用百科
layout: page
sidebar: false
outline: false
comment: false
prev: false
next: false
---

<ClientOnly>
  <YouyongList />
</ClientOnly>
```

`theme/index.ts` 增加：

```ts
import YouyongList from './components/YouyongList.vue'
import YouyongDetail from './components/YouyongDetail.vue'
// enhanceApp:
app.component('YouyongList', YouyongList)
app.component('YouyongDetail', YouyongDetail)
```

（`YouyongDetail` 可先占位空组件，Task 5 填满；或本任务只注册 List，Task 5 再注册 Detail——推荐本任务只注册 List，避免空组件。）

`config.mts` nav 在「朋友圈」后插入：

```ts
{ text: '有用百科', link: '/youyong' },
```

`vite.server.proxy` 增加：

```ts
'/wiki-api': {
  target: 'http://127.0.0.1:8790',
  changeOrigin: true
}
```

- [ ] **Step 4: 本地联调**

保持 API 运行；`npm run docs:dev`；打开 `/youyong` 应能看到列表（若 DB 有数据）。

- [ ] **Step 5: Commit**

```bash
git add docs/youyong.md docs/.vitepress/theme/api/youyongApi.ts docs/.vitepress/theme/components/YouyongList.vue docs/.vitepress/theme/index.ts docs/.vitepress/config.mts
git commit -m "feat(youyong): 添加有用百科列表页"
```

---

### Task 5: 详情页与首页入口

**Files:**
- Create: `docs/.vitepress/theme/components/YouyongDetail.vue`
- Create: `docs/youyong/detail.md`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/index.md`

**Interfaces:**
- Consumes: `fetchArticleDetail`
- Markdown：`markdown-it`（博客已有依赖）+ `dompurify`（需在博客 `package.json` 增加 `dompurify` 与 `@types/dompurify` 若需要）

- [ ] **Step 1: 安装前端消毒依赖**

```bash
cd D:\data\project\blog\ZLVansiit.github.io
npm install dompurify
npm install -D @types/dompurify
```

- [ ] **Step 2: 实现 `YouyongDetail.vue`**

- 从 `window.location.search` 解析 `slug`
- 无 slug 显示错误态
- 渲染：标题、结论引语条（淡入）、`body_md` → markdown-it → DOMPurify
- 来源列表外链 `target=_blank` `rel=noopener`
- 返回 `/youyong`；上一篇/下一篇链到 `?slug=`
- 视觉与列表页同一套 CSS 变量

骨架：

```ts
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { fetchArticleDetail } from '../api/youyongApi'

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

function renderBody(src: string) {
  return DOMPurify.sanitize(md.render(src || ''))
}

function readSlug() {
  return new URLSearchParams(window.location.search).get('slug') || ''
}
```

- [ ] **Step 3: `docs/youyong/detail.md` + 注册组件**

```md
---
title: 有用百科
layout: page
sidebar: false
outline: false
comment: false
prev: false
next: false
---

<ClientOnly>
  <YouyongDetail />
</ClientOnly>
```

- [ ] **Step 4: 首页 features 增加入口**

在 `docs/index.md` 的 `features` 数组追加一项：

```yaml
  - icon:
        dark: /icon/icons003d.png
        light: /icon/icons003.png
    title: 有用百科
    details: 跨学科日更，拓展知识边界
    link: /youyong
```

（若图标撞车，可复用现有 icon 或暂用同一套。）

- [ ] **Step 5: 本地验证详情与返回/上下篇**

- [ ] **Step 6: Commit**

```bash
git add docs/youyong/detail.md docs/.vitepress/theme/components/YouyongDetail.vue docs/.vitepress/theme/index.ts docs/index.md package.json package-lock.json
git commit -m "feat(youyong): 添加有用百科详情页与首页入口"
```

---

### Task 6: 服务器部署、Nginx、cron、首次生成 10 条

**Files:**
- Create: `services/youyong-baike/ecosystem.config.cjs`
- Create: `services/youyong-baike/nginx-wiki-api.conf`
- Deploy on: `124.223.42.161`

**注意：** 使用用户提供的 SSH 凭据完成部署，但绝不把密码/API Key 写入仓库或 commit。

- [ ] **Step 1: 添加 pm2 与 nginx 片段到仓库**

`ecosystem.config.cjs`:

```js
module.exports = {
  apps: [{
    name: 'youyong-baike',
    script: 'server.mjs',
    cwd: '/opt/youyong-baike',
    env: { NODE_ENV: 'production' }
  }]
}
```

`nginx-wiki-api.conf`（说明片段，需合并进 `vansiit.site` server）：

```nginx
location /wiki-api/ {
    proxy_pass http://127.0.0.1:8790;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Commit:

```bash
git add services/youyong-baike/ecosystem.config.cjs services/youyong-baike/nginx-wiki-api.conf
git commit -m "chore(youyong): 添加 pm2 与 nginx 部署片段"
```

- [ ] **Step 2: 上传并安装**

用 SSH（`sshpass` 或交互）登录 `root@124.223.42.161`：

```bash
mkdir -p /opt/youyong-baike/data /opt/youyong-baike/logs
# 从本机 scp 服务代码（不含 .env）
```

服务器：

```bash
cd /opt/youyong-baike
npm install --omit=dev
# 创建 .env：PORT=8790、DEEPSEEK_API_KEY、DB_PATH=./data/youyong.db
npm i -g pm2   # 若无
pm2 start ecosystem.config.cjs
pm2 save
```

配置 Nginx 片段并 `nginx -t && systemctl reload nginx`。

- [ ] **Step 3: 配置 cron**

```bash
crontab -l > /tmp/cron.bak || true
# 追加：
# 0 8 * * * cd /opt/youyong-baike && /usr/bin/node generate.mjs --count=1 >> /opt/youyong-baike/logs/cron.log 2>&1
crontab -e  # 或写入后 crontab /tmp/cron.new
```

确认 `which node` 路径正确。

- [ ] **Step 4: 首次生成 10 条**

```bash
cd /opt/youyong-baike
node generate.mjs --count=10
curl -s https://vansiit.site/wiki-api/articles?page=1&pageSize=20
```

Expected: `total >= 10`

- [ ] **Step 5: 博客侧发布**

推送前端改动到 GitHub（若用户要求 push）；或按现有 `docs:deploy`/`pub` 流程发布，使 `vansiit.cc/youyong` 上线。

- [ ] **Step 6: 验收清单**

- [ ] `https://vansiit.site/wiki-api/health` → ok  
- [ ] `https://vansiit.cc/youyong` 列表有数据  
- [ ] 详情页可读、来源链接可点  
- [ ] cron 已存在；仓库无密钥  

---

## Self-Review Notes

- 规格 §1–10 均有对应 Task：DB/API(1–2)、生成(3)、前端(4–5)、部署验收(6)
- 详情路由明确为 `?slug=`；进程管理明确 pm2
- 无 TBD；密钥不入库
