<template>
  <div class="youyong-page">
    <header class="youyong-header">
      <h1 class="youyong-title">有用百科</h1>
      <p class="youyong-subtitle">跨学科知识短文，每日一知</p>
    </header>

    <nav class="youyong-filters" aria-label="分类筛选">
      <button
        type="button"
        class="youyong-tag"
        :class="{ active: !category }"
        @click="selectCategory('')"
      >
        全部
      </button>
      <button
        v-for="cat in YOUYONG_CATEGORIES"
        :key="cat"
        type="button"
        class="youyong-tag"
        :class="{ active: category === cat }"
        @click="selectCategory(cat)"
      >
        {{ cat }}
      </button>
    </nav>

    <div v-if="loading && !list.length" class="youyong-status">加载中…</div>
    <div v-else-if="error && !list.length" class="youyong-status youyong-error">{{ error }}</div>
    <div v-else-if="!list.length" class="youyong-status">暂无条目</div>

    <ul v-else class="youyong-list">
      <li
        v-for="(item, index) in list"
        :key="item.id"
        class="youyong-item"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <a :href="`/youyong/detail?slug=${encodeURIComponent(item.slug)}`" class="youyong-link">
          <div class="youyong-meta">
            <time class="youyong-date">{{ formatDate(item.created_at) }}</time>
            <span class="youyong-dot" aria-hidden="true">·</span>
            <span class="youyong-category">{{ item.category }}</span>
          </div>
          <h2 class="youyong-item-title">{{ item.title }}</h2>
          <p class="youyong-summary">{{ item.summary }}</p>
        </a>
      </li>
    </ul>

    <nav v-if="totalPages > 1" class="youyong-pager" aria-label="分页">
      <p v-if="error" class="youyong-more-error">{{ error }}</p>
      <div class="youyong-pager-row">
        <button
          type="button"
          class="youyong-page-btn"
          :disabled="loading || page <= 1"
          @click="goPage(page - 1)"
        >
          上一页
        </button>
        <template v-for="(p, i) in pageItems" :key="`${p}-${i}`">
          <span v-if="p === '…'" class="youyong-page-ellipsis" aria-hidden="true">…</span>
          <button
            v-else
            type="button"
            class="youyong-page-btn"
            :class="{ active: p === page }"
            :disabled="loading"
            :aria-current="p === page ? 'page' : undefined"
            @click="goPage(p as number)"
          >
            {{ p }}
          </button>
        </template>
        <button
          type="button"
          class="youyong-page-btn"
          :disabled="loading || page >= totalPages"
          @click="goPage(page + 1)"
        >
          下一页
        </button>
      </div>
      <p class="youyong-pager-meta">共 {{ total }} 条 · 第 {{ page }} / {{ totalPages }} 页</p>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  YOUYONG_CATEGORIES,
  fetchArticleList,
  type YouyongListItem
} from '../api/youyongApi'

const PAGE_SIZE = 12

const list = ref<YouyongListItem[]>([])
const total = ref(0)
const page = ref(1)
const category = ref('')
const loading = ref(false)
const error = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

/** 生成带省略号的页码序列 */
const pageItems = computed(() => {
  const totalP = totalPages.value
  const current = page.value
  if (totalP <= 7) {
    return Array.from({ length: totalP }, (_, i) => i + 1)
  }
  const items: (number | '…')[] = [1]
  const left = Math.max(2, current - 1)
  const right = Math.min(totalP - 1, current + 1)
  if (left > 2) items.push('…')
  for (let i = left; i <= right; i++) items.push(i)
  if (right < totalP - 1) items.push('…')
  items.push(totalP)
  return items
})

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function load() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    const data = await fetchArticleList(page.value, PAGE_SIZE, category.value)
    total.value = data.total
    list.value = data.list
    const maxPage = Math.max(1, Math.ceil(data.total / PAGE_SIZE) || 1)
    if (page.value > maxPage) {
      page.value = maxPage
      const again = await fetchArticleList(page.value, PAGE_SIZE, category.value)
      total.value = again.total
      list.value = again.list
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function selectCategory(cat: string) {
  if (category.value === cat) return
  category.value = cat
  page.value = 1
  load()
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  page.value = p
  load()
  document.querySelector('.youyong-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => load())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;600;700&family=Source+Sans+3:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap');

.youyong-page {
  --youyong-primary: #0085a1;
  --youyong-bg: #f7f4ef;
  --youyong-text: #2c2c2c;
  --youyong-muted: #7a7a7a;
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 1.75rem clamp(36px, 7vw, 96px) 2.5rem;
  box-sizing: border-box;
  font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'PingFang SC',
    'Microsoft YaHei', sans-serif;
  color: var(--youyong-text);
  background-color: var(--youyong-bg);
  background-image:
    radial-gradient(ellipse at 20% 0%, rgba(0, 133, 161, 0.04) 0%, transparent 55%),
    radial-gradient(circle at 80% 100%, rgba(0, 133, 161, 0.03) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  min-height: 60vh;
  border-radius: 2px;
  box-sizing: border-box;
}

.youyong-header {
  margin-bottom: 1.75rem;
  animation: youyong-fade-down 0.6s ease both;
}

.youyong-title {
  margin: 0 0 0.65rem;
  font-family: 'Source Serif 4', 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(1.85rem, 4.2vw, 2.4rem);
  font-weight: 700;
  color: var(--youyong-primary);
  letter-spacing: 0.04em;
}

.youyong-subtitle {
  margin: 0;
  font-family: 'Source Serif 4', 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(1.15rem, 2.6vw, 1.45rem);
  font-weight: 500;
  line-height: 1.55;
  color: var(--youyong-text);
  letter-spacing: 0.08em;
  opacity: 0.88;
}

.youyong-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
  animation: youyong-fade-down 0.55s ease 0.08s both;
}

.youyong-tag {
  padding: 0.35rem 0.85rem;
  border: 1px solid rgba(0, 133, 161, 0.28);
  border-radius: 2px;
  background: transparent;
  color: var(--youyong-muted);
  font-family: inherit;
  font-size: 0.82rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.youyong-tag:hover {
  border-color: var(--youyong-primary);
  color: var(--youyong-primary);
}

.youyong-tag.active {
  background: rgba(0, 133, 161, 0.1);
  border-color: var(--youyong-primary);
  color: var(--youyong-primary);
  font-weight: 500;
}

.youyong-status {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--youyong-muted);
  font-size: 0.95rem;
}

.youyong-error {
  color: #b54a4a;
}

.youyong-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

@media (min-width: 900px) {
  .youyong-list {
    grid-template-columns: 1fr 1fr;
    column-gap: 2.5rem;
  }

  .youyong-item {
    border-bottom: 1px solid rgba(0, 133, 161, 0.12);
  }
}

.youyong-item {
  border-bottom: 1px solid rgba(0, 133, 161, 0.12);
  animation: youyong-fade-up 0.5s ease both;
}

.youyong-link {
  display: block;
  padding: 1.2rem 0;
  text-decoration: none;
  color: inherit;
  transition: padding-left 0.25s ease;
}

.youyong-link:hover {
  padding-left: 0.35rem;
}

.youyong-link:hover .youyong-item-title {
  color: var(--youyong-primary);
}

.youyong-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.45rem;
  font-size: 0.8rem;
  color: var(--youyong-muted);
  letter-spacing: 0.02em;
}

.youyong-date {
  font-variant-numeric: tabular-nums;
}

.youyong-dot {
  opacity: 0.5;
}

.youyong-category {
  color: var(--youyong-primary);
  opacity: 0.85;
}

.youyong-item-title {
  margin: 0 0 0.5rem;
  font-family: 'Source Serif 4', 'Noto Serif SC', 'Songti SC', serif;
  font-size: 1.12rem;
  font-weight: 600;
  line-height: 1.45;
  color: var(--youyong-text);
  transition: color 0.2s ease;
}

.youyong-summary {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--youyong-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.youyong-pager {
  margin-top: 2rem;
  animation: youyong-fade-up 0.5s ease 0.15s both;
}

.youyong-pager-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.youyong-page-btn {
  min-width: 2.25rem;
  height: 2.25rem;
  padding: 0 0.65rem;
  border: 1px solid rgba(0, 133, 161, 0.28);
  border-radius: 2px;
  background: transparent;
  color: var(--youyong-primary);
  font-family: inherit;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.youyong-page-btn:hover:not(:disabled) {
  background: rgba(0, 133, 161, 0.06);
  border-color: var(--youyong-primary);
}

.youyong-page-btn.active {
  background: rgba(0, 133, 161, 0.12);
  border-color: var(--youyong-primary);
  font-weight: 600;
}

.youyong-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.youyong-page-ellipsis {
  color: var(--youyong-muted);
  padding: 0 0.2rem;
}

.youyong-pager-meta {
  margin: 0.85rem 0 0;
  text-align: center;
  font-size: 0.82rem;
  color: var(--youyong-muted);
}

.youyong-more-error {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #b54a4a;
  text-align: center;
}

@keyframes youyong-fade-down {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes youyong-fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .youyong-page {
    padding: 1.25rem 20px 2rem;
  }

  .youyong-item-title {
    font-size: 1.05rem;
  }

  .youyong-tag {
    font-size: 0.78rem;
    padding: 0.3rem 0.7rem;
  }
}
</style>
