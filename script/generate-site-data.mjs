/**
 * 构建前统一生成 RSS 与活动统计等站点数据
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const tasks = ['generate-rss.mjs', 'generate-activity.mjs']

for (const task of tasks) {
  const script = path.join(__dirname, task)
  const result = spawnSync(process.execPath, [script], { stdio: 'inherit' })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
