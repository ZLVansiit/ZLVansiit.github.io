/**
 * 扫描博客文章并生成 docs/public/rss.xml
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DOCS_DIR = path.join(ROOT, 'docs')
const OUTPUT = path.join(DOCS_DIR, 'public', 'rss.xml')

const SITE_URL = 'https://vansiit.cc'
const SITE_TITLE = "Z.L Vansiit's blog"
const SITE_DESCRIPTION =
  '开发 | vansiit，Web & Front-end Engineer | vansiit的个人博客呀'
const AUTHOR = 'Z.L Vansiit'
const MAX_ITEMS = 50

const POST_PATH_RE = /^\d{4}\/\d{2}\/\d{2}\/[^/]+\.md$/

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const data = {}
  for (const line of match[1].split('\n')) {
    const normalized = line.replace(/\r$/, '').trim()
    if (!normalized) continue
    const m = normalized.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (m) data[m[1]] = m[2].trim()
  }
  return data
}

function dateFromPath(relativePath) {
  const parts = relativePath.split('/')
  if (parts.length < 4) return null
  const [year, month, day] = parts
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) {
    return null
  }
  return `${year}-${month}-${day}`
}

function toRfc822(dateStr) {
  const date = new Date(`${dateStr}T12:00:00+08:00`)
  if (Number.isNaN(date.getTime())) return new Date().toUTCString()
  return date.toUTCString()
}

function collectPosts() {
  const posts = []

  function walk(dir, rel = '') {
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
      const childRel = rel ? `${rel}/${name.name}` : name.name
      const abs = path.join(dir, name.name)
      if (name.isDirectory()) {
        walk(abs, childRel)
        continue
      }
      if (!name.name.endsWith('.md') || !POST_PATH_RE.test(childRel.replace(/\\/g, '/'))) {
        continue
      }
      const raw = fs.readFileSync(abs, 'utf8')
      const fm = parseFrontmatter(raw)
      const pathDate = dateFromPath(childRel.replace(/\\/g, '/'))
      const date = fm.date || fm.lastmod || pathDate
      if (!date) continue

      const slug = childRel.replace(/\\/g, '/').replace(/\.md$/, '')
      const title = fm.title || slug.split('/').pop()
      const description = fm.description || fm.title || title

      posts.push({
        title,
        description,
        date,
        link: `${SITE_URL}/${slug}.html`,
        guid: `${SITE_URL}/${slug}.html`,
      })
    }
  }

  walk(DOCS_DIR)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date))
  return posts.slice(0, MAX_ITEMS)
}

function buildRss(items) {
  const lastBuild = new Date().toUTCString()
  const channelLink = `${SITE_URL}/`

  const itemXml = items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <pubDate>${toRfc822(item.date)}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <managingEditor>vansiit@163.com (${escapeXml(AUTHOR)})</managingEditor>
    <webMaster>vansiit@163.com (${escapeXml(AUTHOR)})</webMaster>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${itemXml}
  </channel>
</rss>
`
}

const items = collectPosts()
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
fs.writeFileSync(OUTPUT, buildRss(items), 'utf8')
console.log(`RSS 已生成：${OUTPUT}（${items.length} 篇文章）`)
