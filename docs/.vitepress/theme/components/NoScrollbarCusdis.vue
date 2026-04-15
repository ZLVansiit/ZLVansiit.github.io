<!-- .vitepress/theme/components/NoScrollbarCusdis.vue -->
<template>
  <div class="no-scrollbar-comment-section">
    <!-- 评论头部 -->
    <div class="comment-header">
      <h3 class="comment-title">
        <svg class="comment-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
        <span class="comment-count">{{ commentCount }} 条评论</span>
      </h3>
      <p class="comment-subtitle">留下你的想法，一起参与讨论</p>
    </div>

    <!-- 无滚动条评论容器 -->
    <div class="comment-content-wrapper">
      <!-- Cusdis 容器 -->
      <div class="cusdis-container" ref="cusdisContainer"></div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载评论中...</span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useRoute, useData } from 'vitepress'

const route = useRoute()
const { title, frontmatter } = useData()

// Refs
const cusdisContainer = ref(null)

// 状态
const isLoading = ref(false)
const commentCount = ref(0)
const commentObserver = ref(null)
const currentPageId = ref('')

// 配置
const config = {
  appId: '20c62207-4689-4d4f-9702-fe99b144741a', // 替换为你的 Cusdis App ID
  host: 'https://cusdis.com',
  theme: 'auto'
}

const isDebugEnabled = () => {
  if (typeof window === 'undefined') return false
  return (
      window.location.search.includes('cusdisDebug=1') ||
      window.localStorage.getItem('cusdisDebug') === '1'
  )
}

const debugLog = (...args) => {
  if (!isDebugEnabled()) return
  console.log('[CusdisDebug]', ...args)
}

const renderCusdis = () => {
  debugLog('try render via window.CUSDIS.initial()', {
    hasCusdis: Boolean(window.CUSDIS),
    hasInitial: Boolean(window.CUSDIS?.initial)
  })
  if (typeof window !== 'undefined' && window.CUSDIS?.initial) {
    window.CUSDIS.initial()
  }
}

// 初始化 Cusdis
const initCusdis = async () => {
  if (!cusdisContainer.value) return

  isLoading.value = true

  try {
    // 清空容器
    cusdisContainer.value.innerHTML = ''

    // 生成标识符
    const { pageId, pageUrl, pageTitle } = await generateIdentifiers()
    currentPageId.value = pageId
    debugLog('init identifiers', { pageId, pageUrl, pageTitle, routePath: route.path })
    await updateCommentCount(pageId)

    // 创建 Cusdis 元素
    const cusdisEl = document.createElement('div')
    cusdisEl.id = 'cusdis_thread'
    cusdisEl.dataset.host = config.host
    cusdisEl.dataset.appId = config.appId
    cusdisEl.dataset.pageId = pageId
    cusdisEl.dataset.pageUrl = pageUrl
    cusdisEl.dataset.pageTitle = pageTitle
    cusdisEl.dataset.theme = config.theme

    // 添加自定义类名
    cusdisEl.className = 'no-scrollbar-cusdis'

    cusdisContainer.value.appendChild(cusdisEl)
    debugLog('cusdis thread appended', {
      dataset: {
        host: cusdisEl.dataset.host,
        appId: cusdisEl.dataset.appId,
        pageId: cusdisEl.dataset.pageId,
        pageUrl: cusdisEl.dataset.pageUrl,
        pageTitle: cusdisEl.dataset.pageTitle
      }
    })

    // 加载 Cusdis 脚本
    await loadScript()
    renderCusdis()

    // 初始化完成后调整样式
    setTimeout(() => {
      updateCommentCount(pageId)
      setupCommentObserver()
      updateCommentCount(pageId)
    }, 1000)

  } catch (error) {
    console.error('Cusdis 初始化失败:', error)
    debugLog('init error detail', error)
  } finally {
    isLoading.value = false
  }
}

// 生成标识符
const generateIdentifiers = async () => {
  const normalizedPath = normalizeRoutePath(route.path || '/')
  const candidatePageIds = buildCandidatePageIds(normalizedPath)
  const pageId = await resolvePageId(candidatePageIds, normalizedPath)
  const pageUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${normalizedPath}`
      : ''
  const pageTitle = frontmatter.value.title || title.value || 'Untitled'

  debugLog('page id strategy', {
    normalizedPath,
    selectedPageId: pageId,
    candidatePageIds
  })

  return { pageId, pageUrl, pageTitle }
}

const normalizeRoutePath = (path) => {
  if (!path) return '/'
  if (path === '/') return '/'
  const withoutQuery = path.split('?')[0].split('#')[0]
  const withoutTrailingSlash = withoutQuery.endsWith('/') ? withoutQuery.slice(0, -1) : withoutQuery
  return withoutTrailingSlash.replace(/\.html$/, '') || '/'
}

const buildCusdisSlugPageId = (normalizedPath) => {
  if (normalizedPath === '/') return 'index.html'
  return `${normalizedPath.replace(/^\//, '').replace(/\//g, '-')}.html`
}

const buildCandidatePageIds = (normalizedPath) => {
  const routeDataPath = normalizeRoutePath(route.data?.relativePath?.replace(/\.md$/, '') || '')
  const routeDataSlug = routeDataPath && routeDataPath !== '/'
      ? `${routeDataPath.replace(/^\//, '').replace(/\//g, '-')}.html`
      : ''

  const candidates = [
    buildCusdisSlugPageId(normalizedPath),
    normalizedPath,
    `${normalizedPath}.html`,
    normalizedPath.replace(/^\//, ''),
    route.path || '',
    routeDataSlug
  ]

  return [...new Set(candidates.filter(Boolean))]
}

const resolvePageId = async (candidates, normalizedPath) => {
  const fallback = candidates[0]
  if (typeof window === 'undefined') return fallback

  const cacheKey = `cusdis:pageId:${normalizedPath}`
  const cached = window.sessionStorage.getItem(cacheKey)
  if (cached) {
    debugLog('reuse cached pageId', { normalizedPath, cached })
    return cached
  }

  for (const candidate of candidates) {
    try {
      const url = `${config.host}/api/open/comments?page=1&appId=${config.appId}&pageId=${encodeURIComponent(candidate)}`
      const res = await fetch(url)
      if (!res.ok) continue
      const json = await res.json()
      const count = Number(json?.data?.commentCount || 0)
      debugLog('probe pageId', { candidate, count })
      if (count > 0) {
        window.sessionStorage.setItem(cacheKey, candidate)
        return candidate
      }
    } catch (error) {
      debugLog('probe pageId failed', { candidate, error })
    }
  }

  debugLog('probe fallback pageId', { fallback })
  return fallback
}

// 加载脚本
const loadScript = () => {
  return new Promise((resolve, reject) => {
    const oldScript = document.getElementById('cusdis-noscroll-script')
    if (oldScript) {
      debugLog('reuse existing script', { id: oldScript.id, src: oldScript.getAttribute('src') })
      resolve()
      return
    }

    // 创建新脚本
    const script = document.createElement('script')
    script.id = 'cusdis-noscroll-script'
    script.src = `${config.host}/js/cusdis.es.js`
    script.async = true

    script.onload = () => {
      debugLog('script loaded', { src: script.src })
      resolve()
    }

    script.onerror = (err) => {
      debugLog('script load failed', { src: script.src, err })
      reject(err)
    }

    document.head.appendChild(script)
  })
}

// 更新评论数量
const updateCommentCount = async (pageId = currentPageId.value) => {
  if (!pageId) return

  let apiCount = 0
  try {
    const url = `${config.host}/api/open/comments?page=1&appId=${config.appId}&pageId=${encodeURIComponent(pageId)}`
    const res = await fetch(url)
    if (res.ok) {
      const json = await res.json()
      apiCount = Number(json?.data?.commentCount || 0)
    }
  } catch (error) {
    debugLog('comment count api failed', { pageId, error })
  }

  const selectors = ['.cds-comment', '.cds-comment-item', '[data-cusdis-comment]']
  const counts = selectors.map(selector => ({
    selector,
    count: document.querySelectorAll(selector).length
  }))
  const domCount = Math.max(...counts.map(item => item.count), 0)

  const nextCount = Math.max(apiCount, domCount)
  commentCount.value = nextCount
  debugLog('comment count updated', { pageId, nextCount, apiCount, domCount, counts })
}

const setupCommentObserver = () => {
  if (!cusdisContainer.value || !window.MutationObserver) return

  if (commentObserver.value) {
    commentObserver.value.disconnect()
  }

  commentObserver.value = new MutationObserver((mutations) => {
    const addedNodes = mutations.reduce((sum, item) => sum + item.addedNodes.length, 0)
    const removedNodes = mutations.reduce((sum, item) => sum + item.removedNodes.length, 0)
    debugLog('dom mutation detected', { addedNodes, removedNodes })
    updateCommentCount()
  })

  commentObserver.value.observe(cusdisContainer.value, {
    childList: true,
    subtree: true
  })

  debugLog('mutation observer attached')
}

// 清理
const cleanup = () => {
  if (commentObserver.value) {
    commentObserver.value.disconnect()
    commentObserver.value = null
  }
  debugLog('cleanup completed')
}

// 生命周期
onMounted(() => {
  initCusdis()
})

onUnmounted(() => {
  cleanup()
})

// 路由变化时重新初始化
watch(() => route.path, () => {
  cleanup()
  nextTick(() => {
    initCusdis()
  })
})
</script>

<style scoped>
/* 主容器 */
.no-scrollbar-comment-section {
  margin: 2.5rem 0;
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--comment-bg, #fff);
  border: 1px solid var(--comment-border, #e5e7eb);
  position: relative;
}

/* 头部样式 */
.comment-header {
  margin-bottom: 1.25rem;
  text-align: left;
}

.comment-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--comment-title-color, #111827);
  margin-bottom: 0.35rem;
}

.comment-icon {
  width: 22px;
  height: 22px;
  color: var(--comment-icon-color, #2563eb);
}

.comment-count {
  font-size: 1.75rem;
  color: var(--comment-count-color, #111827);
  -webkit-text-fill-color: initial;
}

.comment-subtitle {
  color: var(--comment-subtitle-color, #6b7280);
  font-size: 0.92rem;
  margin: 0;
}

/* 评论内容容器 */
.comment-content-wrapper {
  min-height: 80px;
  position: relative;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--loading-color, #6b7280);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--spinner-bg, #e5e7eb);
  border-top-color: var(--spinner-color, #2563eb);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Cusdis 容器 */
.cusdis-container {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .no-scrollbar-comment-section {
    padding: 1rem;
    margin: 2rem 0;
    border-radius: 12px;
  }

  .comment-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .no-scrollbar-comment-section {
    padding: 1rem;
    border-radius: 8px;
  }

  .comment-title {
    flex-direction: column;
    gap: 8px;
    font-size: 1.1rem;
  }
}
</style>

<style>
/* 允许评论列表自然撑开，使用 Cusdis 自带分页 */
.cds-comments {
  overflow: visible !important;
  max-height: none !important;
  height: auto !important;
  padding: 0 !important;
}

/* 隐藏评论区滚动条（保留滚动能力） */
.no-scrollbar-cusdis,
.no-scrollbar-cusdis .cds-comments,
.no-scrollbar-cusdis .cds-comment-list,
.no-scrollbar-cusdis .cds-comment-box,
.no-scrollbar-cusdis .cds-textarea {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.no-scrollbar-cusdis::-webkit-scrollbar,
.no-scrollbar-cusdis .cds-comments::-webkit-scrollbar,
.no-scrollbar-cusdis .cds-comment-list::-webkit-scrollbar,
.no-scrollbar-cusdis .cds-comment-box::-webkit-scrollbar,
.no-scrollbar-cusdis .cds-textarea::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.cds-comment-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 0.75rem !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 表单区域自定义 */
.no-scrollbar-cusdis .cds-form,
.no-scrollbar-cusdis .cds-comment-box {
  background: var(--comment-form-bg, #fff) !important;
  border: 1px solid var(--comment-form-border, #e5e7eb) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
}

.no-scrollbar-cusdis .cds-form {
  padding: 1rem !important;
}

.no-scrollbar-cusdis .cds-form-control {
  margin-bottom: 0.75rem !important;
}

.no-scrollbar-cusdis .cds-input,
.no-scrollbar-cusdis .cds-textarea {
  border: 1px solid var(--comment-input-border, #d1d5db) !important;
  border-radius: 8px !important;
  background: var(--comment-input-bg, #fff) !important;
  color: var(--comment-input-color, #111827) !important;
  box-shadow: none !important;
}

.no-scrollbar-cusdis .cds-input {
  min-height: 40px !important;
}

.no-scrollbar-cusdis .cds-input:focus,
.no-scrollbar-cusdis .cds-textarea:focus {
  border-color: var(--comment-focus-border, #2563eb) !important;
}

.no-scrollbar-cusdis .cds-textarea {
  min-height: 120px !important;
  max-height: none !important;
  resize: vertical !important;
  overflow-y: hidden !important;
}

.no-scrollbar-cusdis .cds-submit-btn,
.no-scrollbar-cusdis button[type="submit"] {
  background: var(--comment-submit-bg, #1677ff) !important;
  color: #fff !important;
  border: 0 !important;
  border-radius: 8px !important;
  padding: 0.5rem 1rem !important;
  font-weight: 600 !important;
}

.no-scrollbar-cusdis .cds-submit-btn:hover,
.no-scrollbar-cusdis button[type="submit"]:hover {
  filter: brightness(0.95);
}

/* 评论项美化 */
.cds-comment {
  border-radius: 10px !important;
  padding: 0.9rem 0.95rem !important;
  margin-bottom: 0.55rem !important;
  background: var(--comment-item-bg, #fff) !important;
  border: 1px solid var(--comment-item-border, #e5e7eb) !important;
  box-shadow: none !important;
}

.no-scrollbar-cusdis .cds-comment-author {
  color: var(--comment-author-color, #111827) !important;
  font-weight: 600 !important;
}

.no-scrollbar-cusdis .cds-comment-time {
  color: var(--comment-time-color, #6b7280) !important;
  font-size: 0.85rem !important;
}

.no-scrollbar-cusdis .cds-comment-content {
  color: var(--comment-content-color, #111827) !important;
  line-height: 1.7 !important;
}

.dark .cds-comment {
  background: var(--comment-item-bg, #0f172a) !important;
  border-color: var(--comment-item-border, #334155) !important;
}

/* 分页样式修复 */
.cds-pagination {
  margin-top: 1.2rem !important;
  padding-top: 1rem !important;
  border-top: 1px solid var(--pagination-border, #e5e7eb) !important;
  display: flex !important;
  justify-content: center !important;
  gap: 0.5rem !important;
}

.dark .cds-pagination {
  border-top-color: var(--pagination-border, #334155) !important;
}

/* === 深色模式变量 === */
.dark {
  --comment-bg: #111827;
  --comment-border: #334155;
  --comment-title-color: #f1f5f9;
  --comment-icon-color: #60a5fa;
  --comment-subtitle-color: #94a3b8;
  --comment-count-color: #f1f5f9;
  --loading-color: #94a3b8;
  --spinner-bg: #334155;
  --spinner-color: #60a5fa;
  --comment-form-bg: #0f172a;
  --comment-form-border: #334155;
  --comment-input-bg: #0b1220;
  --comment-input-border: #334155;
  --comment-input-color: #e5e7eb;
  --comment-focus-border: #60a5fa;
  --comment-submit-bg: #3b82f6;
  --comment-item-bg: #0f172a;
  --comment-item-border: #334155;
  --comment-author-color: #f1f5f9;
  --comment-time-color: #94a3b8;
  --comment-content-color: #e5e7eb;
  --pagination-border: #334155;
}

/* === 响应式调整 === */
@media (max-width: 768px) {
  .cds-comment {
    padding: 1.25rem !important;
  }

  .cds-comment-box {
    padding: 1.25rem !important;
  }

  .cds-pagination {
    flex-wrap: wrap !important;
  }
}

@media (max-width: 480px) {
  .cds-comment {
    padding: 1rem !important;
  }

  .cds-comment-box {
    padding: 1rem !important;
  }
}
</style>
