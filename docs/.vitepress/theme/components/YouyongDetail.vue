<template>
  <div class="youyong-detail">
    <div v-if="!slug" class="youyong-status youyong-error">缺少文章标识</div>
    <div v-else-if="loading" class="youyong-status">加载中…</div>
    <div v-else-if="error" class="youyong-status youyong-error">{{ error }}</div>

    <template v-else-if="article">
      <header class="youyong-header">
        <div class="youyong-meta">
          <time class="youyong-date">{{ formatDate(article.created_at) }}</time>
          <span class="youyong-dot" aria-hidden="true">·</span>
          <span class="youyong-category">{{ article.category }}</span>
        </div>
        <h1 class="youyong-title">{{ article.title }}</h1>
        <blockquote v-if="article.summary" class="youyong-summary">{{ article.summary }}</blockquote>
      </header>

      <article class="youyong-body" v-html="renderedBody" />

      <section v-if="article.sources?.length" class="youyong-sources">
        <h2 class="youyong-sources-title">参考来源</h2>
        <ul class="youyong-sources-list">
          <li v-for="(src, i) in article.sources" :key="i">
            <a :href="src.url" target="_blank" rel="noopener noreferrer">{{ src.title }}</a>
          </li>
        </ul>
      </section>

      <nav class="youyong-nav" aria-label="文章导航">
        <a
          v-if="article.prev_slug"
          :href="`/youyong/detail?slug=${article.prev_slug}`"
          class="youyong-nav-link youyong-nav-prev"
        >
          ← 上一篇
        </a>
        <span v-else class="youyong-nav-placeholder" />
        <a href="/youyong" class="youyong-nav-back">返回列表</a>
        <a
          v-if="article.next_slug"
          :href="`/youyong/detail?slug=${article.next_slug}`"
          class="youyong-nav-link youyong-nav-next"
        >
          下一篇 →
        </a>
        <span v-else class="youyong-nav-placeholder" />
      </nav>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { fetchArticleDetail, type YouyongArticle } from '../api/youyongApi'

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

function renderBody(src: string) {
  return DOMPurify.sanitize(md.render(src || ''))
}

function readSlug() {
  return new URLSearchParams(window.location.search).get('slug') || ''
}

const slug = ref('')
const article = ref<YouyongArticle | null>(null)
const loading = ref(false)
const error = ref('')

const renderedBody = computed(() =>
  article.value ? renderBody(article.value.body_md) : ''
)

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
  slug.value = readSlug()
  if (!slug.value) return

  loading.value = true
  error.value = ''
  article.value = null
  try {
    article.value = await fetchArticleDetail(slug.value)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '加载失败'
    error.value = msg.includes('404') ? '文章不存在' : msg
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;600;700&family=Source+Sans+3:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap');

.youyong-detail {
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
  margin-bottom: 2rem;
  animation: youyong-fade-down 0.6s ease both;
}

.youyong-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
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

.youyong-title {
  margin: 0 0 1.25rem;
  font-family: 'Source Serif 4', 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  font-weight: 600;
  line-height: 1.4;
  color: var(--youyong-primary);
  letter-spacing: 0.02em;
}

.youyong-summary {
  margin: 0;
  padding: 1rem 1.25rem;
  border-left: 3px solid var(--youyong-primary);
  background: rgba(0, 133, 161, 0.05);
  font-family: 'Source Serif 4', 'Noto Serif SC', 'Songti SC', serif;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--youyong-text);
  animation: youyong-summary-in 0.7s ease 0.15s both;
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

.youyong-body {
  font-size: 0.95rem;
  line-height: 1.75;
  animation: youyong-fade-up 0.5s ease 0.1s both;
}

.youyong-body :deep(p) {
  margin: 0 0 1rem;
}

.youyong-body :deep(h2),
.youyong-body :deep(h3) {
  margin: 1.75rem 0 0.75rem;
  font-family: 'Source Serif 4', 'Noto Serif SC', 'Songti SC', serif;
  font-weight: 600;
  color: var(--youyong-text);
}

.youyong-body :deep(h2) {
  font-size: 1.2rem;
}

.youyong-body :deep(h3) {
  font-size: 1.05rem;
}

.youyong-body :deep(ul),
.youyong-body :deep(ol) {
  margin: 0 0 1rem;
  padding-left: 1.5rem;
}

.youyong-body :deep(li) {
  margin-bottom: 0.35rem;
}

.youyong-body :deep(a) {
  color: var(--youyong-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.youyong-body :deep(blockquote) {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  border-left: 2px solid rgba(0, 133, 161, 0.3);
  color: var(--youyong-muted);
}

.youyong-body :deep(code) {
  font-size: 0.88em;
  padding: 0.15em 0.35em;
  border-radius: 2px;
  background: rgba(0, 133, 161, 0.08);
}

.youyong-body :deep(pre) {
  margin: 1rem 0;
  padding: 1rem;
  overflow-x: auto;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.04);
  font-size: 0.88rem;
}

.youyong-sources {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 133, 161, 0.12);
  animation: youyong-fade-up 0.5s ease 0.25s both;
}

.youyong-sources-title {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--youyong-muted);
}

.youyong-sources-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.youyong-sources-list li {
  margin-bottom: 0.4rem;
}

.youyong-sources-list a {
  font-size: 0.9rem;
  color: var(--youyong-primary);
  text-decoration: none;
  border-bottom: 1px solid rgba(0, 133, 161, 0.25);
  transition: border-color 0.2s ease;
}

.youyong-sources-list a:hover {
  border-color: var(--youyong-primary);
}

.youyong-nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 133, 161, 0.12);
  animation: youyong-fade-up 0.5s ease 0.3s both;
}

.youyong-nav-link {
  font-size: 0.9rem;
  color: var(--youyong-primary);
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.youyong-nav-link:hover {
  opacity: 0.75;
}

.youyong-nav-prev {
  justify-self: start;
}

.youyong-nav-next {
  justify-self: end;
}

.youyong-nav-back {
  font-size: 0.85rem;
  color: var(--youyong-muted);
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: color 0.2s ease;
}

.youyong-nav-back:hover {
  color: var(--youyong-primary);
}

.youyong-nav-placeholder {
  display: block;
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
  .youyong-detail {
    padding: 1.5rem 1rem 2.5rem;
  }

  .youyong-nav {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .youyong-nav-prev,
  .youyong-nav-next {
    justify-self: center;
  }

  .youyong-nav-placeholder {
    display: none;
  }
}
</style>
