/**
 * 从文章与朋友圈数据源提取发布日期
 */
import fs from 'node:fs'
import path from 'node:path'

const POST_PATH_RE = /^\d{4}\/\d{2}\/\d{2}\/[^/]+\.md$/

export function parseFrontmatter(raw) {
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

export function dateFromPath(relativePath) {
  const parts = relativePath.replace(/\\/g, '/').split('/')
  if (parts.length < 4) return null
  const [year, month, day] = parts
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) {
    return null
  }
  return `${year}-${month}-${day}`
}

export function normalizeDate(value) {
  if (!value) return null
  const m = String(value).match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : null
}

/** @param {string} docsDir */
export function collectArticleDates(docsDir) {
  const dates = []

  function walk(dir, rel = '') {
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
      const childRel = rel ? `${rel}/${name.name}` : name.name
      const abs = path.join(dir, name.name)
      if (name.isDirectory()) {
        walk(abs, childRel)
        continue
      }
      const normalizedRel = childRel.replace(/\\/g, '/')
      if (!name.name.endsWith('.md') || !POST_PATH_RE.test(normalizedRel)) {
        continue
      }
      const raw = fs.readFileSync(abs, 'utf8')
      const fm = parseFrontmatter(raw)
      const date = normalizeDate(fm.date || dateFromPath(normalizedRel))
      if (date) dates.push({ type: 'article', date })
    }
  }

  walk(docsDir)
  return dates
}

/** @param {string} momentsFile */
export function collectMomentDates(momentsFile) {
  const raw = fs.readFileSync(momentsFile, 'utf8')
  const dates = []
  const re = /time:\s*['"](\d{4}-\d{2}-\d{2})/g
  let match
  while ((match = re.exec(raw)) !== null) {
    dates.push({ type: 'moment', date: match[1] })
  }
  return dates
}

/** @param {{ type: string, date: string }[]} entries */
export function aggregateDailyCounts(entries) {
  /** @type {Record<string, { articles: number, moments: number, total: number }>} */
  const counts = {}
  for (const entry of entries) {
    if (!counts[entry.date]) {
      counts[entry.date] = { articles: 0, moments: 0, total: 0 }
    }
    if (entry.type === 'article') counts[entry.date].articles += 1
    if (entry.type === 'moment') counts[entry.date].moments += 1
    counts[entry.date].total += 1
  }
  return counts
}
