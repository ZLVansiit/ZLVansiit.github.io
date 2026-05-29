<template>
  <section class="activity-heatmap" aria-label="内容发布月度热力图">
    <h3 class="heatmap-title">码字与絮语 · 月度分布</h3>
    <p class="heatmap-subtitle">文章与朋友圈的更新足迹，一格一月</p>

    <div class="heatmap-table">
      <div class="header-row">
        <span class="corner" aria-hidden="true" />
        <span v-for="label in monthLabels" :key="label" class="month-label">{{ label }}</span>
      </div>

      <div v-for="year in years" :key="year" class="data-row">
        <span class="year-label">{{ year }}</span>
        <div
          v-for="month in 12"
          :key="`${year}-${month}`"
          class="cell"
          :class="levelClass(year, month)"
          :title="cellTitle(year, month)"
          :aria-label="cellTitle(year, month)"
        />
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

const monthLabels = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const months = activityData.months || {}
const years = activityData.years || []
const rangeStart = activityData.rangeStart
const rangeEnd = activityData.rangeEnd

const rangeText = computed(() => {
  const { totalArticles, totalMoments, activeMonths } = activityData.summary || {}
  return `${rangeStart} 至 ${rangeEnd} · 共 ${activeMonths ?? 0} 个月有更新（文章 ${totalArticles ?? 0} 篇，朋友圈 ${totalMoments ?? 0} 条）`
})

function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function getStat(year, month) {
  return months[monthKey(year, month)] || { articles: 0, moments: 0, total: 0 }
}

function levelClass(year, month) {
  const total = getStat(year, month).total
  if (total <= 0) return 'level-0'
  if (total === 1) return 'level-1'
  if (total === 2) return 'level-2'
  if (total <= 4) return 'level-3'
  return 'level-4'
}

function cellTitle(year, month) {
  const stat = getStat(year, month)
  const parts = [`${year} 年 ${monthLabels[month - 1]}`]
  if (stat.articles) parts.push(`${stat.articles} 篇文章`)
  if (stat.moments) parts.push(`${stat.moments} 条朋友圈`)
  if (!stat.total) parts.push('无更新')
  return parts.join('，')
}
</script>

<style scoped>
.activity-heatmap {
  margin: 0 0 1.6rem;
  padding: 16px;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.04);
}

.heatmap-title {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.heatmap-subtitle {
  margin: 3px 0 13px;
  font-size: 0.68rem;
  color: var(--vp-c-text-2);
}

.heatmap-table {
  display: grid;
  gap: 3px;
  width: 100%;
}

.header-row,
.data-row {
  display: grid;
  grid-template-columns: 32px repeat(12, minmax(0, 1fr));
  gap: 3px;
  align-items: stretch;
}

.corner {
  display: block;
}

.month-label,
.year-label {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: var(--vp-c-text-2);
}

.year-label {
  justify-content: flex-end;
  padding-right: 5px;
}

.cell {
  aspect-ratio: 1;
  width: 100%;
  min-height: 18px;
  border-radius: 3px;
  background: #ebedf0;
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
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 11px;
  font-size: 10px;
  color: var(--vp-c-text-2);
}

.legend {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

.legend .cell {
  width: 10px;
  height: 10px;
  min-height: 10px;
  aspect-ratio: auto;
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
    padding: 13px;
  }

  .header-row,
  .data-row {
    grid-template-columns: 26px repeat(12, minmax(0, 1fr));
    gap: 2px;
  }

  .month-label,
  .year-label {
    font-size: 8px;
  }

  .cell {
    min-height: 14px;
    border-radius: 2px;
  }
}
</style>
