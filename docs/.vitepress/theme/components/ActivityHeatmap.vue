<template>
  <section class="activity-heatmap" aria-label="内容发布热力图">
    <h3 class="heatmap-title">时空坐标系下的能量波动分布</h3>

    <div class="heatmap-scroll">
      <div class="heatmap-body">
        <div class="weekday-col" aria-hidden="true">
          <span v-for="label in weekdayLabels" :key="label" class="weekday-label">{{ label }}</span>
        </div>

        <div class="heatmap-main">
          <div class="month-row" aria-hidden="true">
            <span
              v-for="(month, index) in monthLabels"
              :key="`${month}-${index}`"
              class="month-label"
              :style="{ gridColumn: index + 1 }"
            >
              {{ month }}
            </span>
          </div>

          <div class="grid">
            <template v-for="(week, weekIndex) in weekColumns" :key="weekIndex">
              <div
                v-for="(day, dayIndex) in week"
                :key="`${weekIndex}-${dayIndex}`"
                class="cell"
                :class="levelClass(day)"
                :title="cellTitle(day)"
                :aria-label="cellTitle(day)"
              />
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="heatmap-footer">
      <span class="range-text">{{ rangeText }}</span>
      <div class="legend" aria-hidden="true">
        <span>较少</span>
        <span class="cell level-0" />
        <span class="cell level-1" />
        <span class="cell level-2" />
        <span class="cell level-3" />
        <span class="cell level-4" />
        <span>较多</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import activityData from '../data/activity.json'

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']
const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

const counts = activityData.counts || {}
const rangeStart = activityData.rangeStart
const rangeEnd = activityData.rangeEnd

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const weekColumns = computed(() => {
  const start = parseDate(rangeStart)
  const end = parseDate(rangeEnd)
  const gridStart = getMonday(start)
  const weeks = []
  let cursor = new Date(gridStart)

  while (cursor <= end || weeks.length === 0) {
    const week = []
    for (let i = 0; i < 7; i += 1) {
      const current = addDays(cursor, i)
      const key = formatDate(current)
      const inRange = current >= start && current <= end
      const stat = counts[key] || { articles: 0, moments: 0, total: 0 }
      week.push({
        date: key,
        inRange,
        ...stat,
      })
    }
    weeks.push(week)
    cursor = addDays(cursor, 7)
    if (cursor > addDays(end, 6)) break
  }

  return weeks
})

const monthLabels = computed(() => {
  const labels = []
  let lastMonth = -1
  for (const week of weekColumns.value) {
    const visibleDay = week.find((day) => day.inRange)
    if (!visibleDay) {
      labels.push('')
      continue
    }
    const month = parseDate(visibleDay.date).getMonth()
    if (month !== lastMonth) {
      labels.push(monthNames[month])
      lastMonth = month
    } else {
      labels.push('')
    }
  }
  return labels
})

const rangeText = computed(() => `${rangeStart} 至 ${rangeEnd}`)

function levelClass(day) {
  if (!day.inRange) return 'level-empty'
  const total = day.total || 0
  if (total <= 0) return 'level-0'
  if (total === 1) return 'level-1'
  if (total === 2) return 'level-2'
  if (total === 3) return 'level-3'
  return 'level-4'
}

function cellTitle(day) {
  if (!day.inRange) return ''
  const parts = [`${day.date}`]
  if (day.articles) parts.push(`${day.articles} 篇文章`)
  if (day.moments) parts.push(`${day.moments} 条朋友圈`)
  if (!day.total) parts.push('无更新')
  return parts.join('，')
}
</script>

<style scoped>
.activity-heatmap {
  margin: 0 0 2rem;
  padding: 20px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.heatmap-title {
  margin: 0 0 16px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.heatmap-scroll {
  overflow-x: auto;
}

.heatmap-body {
  display: flex;
  gap: 8px;
  min-width: 720px;
}

.weekday-col {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 3px;
  padding-top: 22px;
}

.weekday-label {
  font-size: 11px;
  line-height: 12px;
  color: var(--vp-c-text-2);
}

.heatmap-main {
  flex: 1;
  min-width: 0;
}

.month-row {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 15px;
  gap: 3px;
  height: 18px;
  margin-bottom: 4px;
}

.month-label {
  font-size: 11px;
  line-height: 18px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.grid {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 12px);
  grid-auto-columns: 12px;
  gap: 3px;
}

.cell {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: #ebedf0;
}

.level-empty {
  background: transparent;
}

.level-0 {
  background: #ebedf0;
}

.level-1 {
  background: #9be9a8;
}

.level-2 {
  background: #40c463;
}

.level-3 {
  background: #30a14e;
}

.level-4 {
  background: #216e39;
}

.heatmap-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.legend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend .cell {
  width: 12px;
  height: 12px;
}

.dark .level-0 {
  background: #161b22;
}

.dark .level-1 {
  background: #0e4429;
}

.dark .level-2 {
  background: #006d32;
}

.dark .level-3 {
  background: #26a641;
}

.dark .level-4 {
  background: #39d353;
}

@media (max-width: 640px) {
  .activity-heatmap {
    padding: 16px;
  }

  .heatmap-body {
    min-width: 640px;
  }
}
</style>
