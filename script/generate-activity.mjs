/**
 * 统计文章与朋友圈按日分布，生成 activity.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  aggregateDailyCounts,
  collectArticleDates,
  collectMomentDates,
} from './lib/content-dates.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DOCS_DIR = path.join(ROOT, 'docs')
const MOMENTS_FILE = path.join(ROOT, 'docs/.vitepress/theme/data/moments.ts')
const OUTPUT = path.join(ROOT, 'docs/.vitepress/theme/data/activity.json')

const RANGE_DAYS = 365

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildRange() {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(start.getDate() - (RANGE_DAYS - 1))
  return { start: formatDate(start), end: formatDate(end) }
}

function main() {
  const articleDates = collectArticleDates(DOCS_DIR)
  const momentDates = collectMomentDates(MOMENTS_FILE)
  const allEntries = [...articleDates, ...momentDates]
  const counts = aggregateDailyCounts(allEntries)
  const { start, end } = buildRange()

  let activeDays = 0
  let totalArticles = 0
  let totalMoments = 0
  for (const value of Object.values(counts)) {
    if (value.total > 0) activeDays += 1
    totalArticles += value.articles
    totalMoments += value.moments
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    rangeStart: start,
    rangeEnd: end,
    counts,
    summary: {
      totalArticles,
      totalMoments,
      activeDays,
    },
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(
    `活动统计已生成：${OUTPUT}（文章 ${totalArticles} 篇，朋友圈 ${totalMoments} 条，活跃 ${activeDays} 天）`,
  )
}

main()
