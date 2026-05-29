/**
 * 统计文章与朋友圈按月分布，生成 activity.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  aggregateMonthlyCounts,
  buildMonthlyRange,
  collectArticleDates,
  collectMomentDates,
} from './lib/content-dates.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DOCS_DIR = path.join(ROOT, 'docs')
const MOMENTS_FILE = path.join(ROOT, 'docs/.vitepress/theme/data/moments.ts')
const OUTPUT = path.join(ROOT, 'docs/.vitepress/theme/data/activity.json')

function main() {
  const articleDates = collectArticleDates(DOCS_DIR)
  const momentDates = collectMomentDates(MOMENTS_FILE)
  const allEntries = [...articleDates, ...momentDates]
  const months = aggregateMonthlyCounts(allEntries)
  const { rangeStart, rangeEnd, years } = buildMonthlyRange(months)

  let activeMonths = 0
  let totalArticles = 0
  let totalMoments = 0
  for (const value of Object.values(months)) {
    if (value.total > 0) activeMonths += 1
    totalArticles += value.articles
    totalMoments += value.moments
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    rangeStart,
    rangeEnd,
    years,
    months,
    summary: {
      totalArticles,
      totalMoments,
      activeMonths,
    },
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(
    `活动统计已生成：${OUTPUT}（文章 ${totalArticles} 篇，朋友圈 ${totalMoments} 条，活跃 ${activeMonths} 个月）`,
  )
}

main()
