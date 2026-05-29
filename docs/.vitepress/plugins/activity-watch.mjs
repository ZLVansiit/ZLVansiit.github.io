import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ACTIVITY_SCRIPT = path.resolve(__dirname, '../../script/generate-activity.mjs')

/** 开发时监听文章与朋友圈变更，自动重算热力图数据 */
export function activityWatchPlugin() {
  let timer = null

  const regen = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      spawnSync(process.execPath, [ACTIVITY_SCRIPT], { stdio: 'inherit' })
    }, 300)
  }

  const shouldRegen = (file) => {
    const normalized = file.replace(/\\/g, '/')
    if (normalized.includes('/docs/.vitepress/theme/data/moments.ts')) return true
    if (!normalized.includes('/docs/')) return false
    return /\/docs\/\d{4}\/\d{2}\/\d{2}\/.+\.md$/.test(normalized)
  }

  return {
    name: 'vitepress-activity-watch',
    configureServer(server) {
      for (const event of ['change', 'add', 'unlink']) {
        server.watcher.on(event, (file) => {
          if (shouldRegen(file)) regen()
        })
      }
    },
  }
}
