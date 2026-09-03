<template>
  <div class="youyong-page">
    <header class="youyong-header">
      <h1 class="youyong-title">有用百科</h1>
      <p class="youyong-subtitle">跨学科知识短文，每日一知</p>
    </header>

    <div v-if="loading && !list.length" class="youyong-status">加载中…</div>
    <div v-else-if="error && !list.length" class="youyong-status youyong-error">{{ error }}</div>
    <div v-else-if="!list.length" class="youyong-status">暂无条目</div>

    <ul v-else class="youyong-list">
      <li
        v-for="(item, index) in list"
        :key="item.id"
        class="youyong-item"
        :style="{ animationDelay: `${index % 20 * 60}ms` }"
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

    <div v-if="list.length && list.length < total" class="youyong-more-wrap">
      <p v-if="error" class="youyong-more-error">{{ error }}</p>
      <button
        type="button"
        class="youyong-more"
        :disabled="loading"
        @click="loadMore"
      >
        {{ loading ? '加载中…' : '加载更多' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchArticleList, type YouyongListItem } from '../api/youyongApi'

const list = ref<YouyongListItem[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const error = ref('')

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function load(reset = false) {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    if (reset) {
      page.value = 1
      list.value = []
    }
    const data = await fetchArticleList(page.value, 20)
    total.value = data.total
    list.value = reset ? data.list : list.value.concat(data.list)
    page.value += 1
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '加载失败'
    error.value = msg
  } finally {
    loading.value = false
  }
}

function loadMore() {
  load(false)
}

onMounted(() => load(true))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;600;700&family=Source+Sans+3:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap');

.youyong-page {
  --youyong-primary: #0085a1;
  --youyong-bg: #f7f4ef;
  --youyong-text: #2c2c2c;
  --youyong-muted: #7a7a7a;
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
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
}

.youyong-header {
  margin-bottom: 2.5rem;
  animation: youyong-fade-down 0.6s ease both;
}

.youyong-title {
  margin: 0 0 0.5rem;
  font-family: 'Source Serif 4', 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 600;
  color: var(--youyong-primary);
  letter-spacing: 0.02em;
}

.youyong-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: var(--youyong-muted);
  letter-spacing: 0.04em;
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
}

.youyong-item {
  border-bottom: 1px solid rgba(0, 133, 161, 0.12);
  animation: youyong-fade-up 0.5s ease both;
}

.youyong-item:last-child {
  border-bottom: none;
}

.youyong-link {
  display: block;
  padding: 1.35rem 0;
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
  font-size: 1.15rem;
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
  animation: youyong-summary-in 0.6s ease both;
  animation-delay: 0.15s;
}

.youyong-more-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: 2rem;
  animation: youyong-fade-up 0.5s ease 0.2s both;
}

.youyong-more-error {
  margin: 0;
  font-size: 0.9rem;
  color: #b54a4a;
  text-align: center;
}

.youyong-more {
  padding: 0.6rem 1.75rem;
  border: 1px solid rgba(0, 133, 161, 0.35);
  border-radius: 2px;
  background: transparent;
  color: var(--youyong-primary);
  font-family: inherit;
  font-size: 0.9rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.youyong-more:hover:not(:disabled) {
  background: rgba(0, 133, 161, 0.06);
  border-color: var(--youyong-primary);
}

.youyong-more:disabled {
  opacity: 0.6;
  cursor: wait;
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

@keyframes youyong-summary-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .youyong-page {
    padding: 1.5rem 1rem 2.5rem;
  }

  .youyong-item-title {
    font-size: 1.05rem;
  }
}
</style>
