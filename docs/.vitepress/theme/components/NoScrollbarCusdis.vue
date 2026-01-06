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
    <div class="comment-content-wrapper" ref="contentWrapper">
      <!-- Cusdis 容器 -->
      <div class="cusdis-container" ref="cusdisContainer"></div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载评论中...</span>
      </div>

      <!-- 空状态 -->
      <div v-if="!isLoading && commentCount === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
        <p>暂无评论，留下第一条评论吧！</p>
      </div>
    </div>

    <!-- 自定义滚动指示器 -->
    <div v-if="showScrollHint" class="scroll-hint" @click="scrollComments">
      <div class="hint-content">
        <svg class="hint-icon" viewBox="0 0 24 24">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
        <span>滚动查看更多评论</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useRoute, useData } from 'vitepress'

const route = useRoute()
const { title, frontmatter, site } = useData()

// Refs
const cusdisContainer = ref(null)
const contentWrapper = ref(null)

// 状态
const isLoading = ref(false)
const commentCount = ref(0)
const showScrollHint = ref(false)
const resizeObserver = ref(null)

// 配置
const config = {
  appId: '20c62207-4689-4d4f-9702-fe99b144741a', // 替换为你的 Cusdis App ID
  host: 'https://cusdis.com',
  theme: 'auto'
}

// 初始化 Cusdis
const initCusdis = async () => {
  if (!cusdisContainer.value) return

  isLoading.value = true
  showScrollHint.value = false

  try {
    // 清空容器
    cusdisContainer.value.innerHTML = ''

    // 生成标识符
    const { pageId, pageUrl, pageTitle } = generateIdentifiers()

    // 创建 Cusdis 元素
    const cusdisEl = document.createElement('div')
    cusdisEl.id = 'cusdis_thread'
    cusdisEl.dataset.host = config.host
    cusdisEl.dataset.appId = config.appId
    cusdisEl.dataset.pageId = pageId
    cusdisEl.dataset.pageUrl = pageUrl
    cusdisEl.dataset.pageTitle = pageTitle
    cusdisEl.dataset.theme = config.theme
    cusdisEl.dataset.lazy = 'true'

    // 添加自定义类名
    cusdisEl.className = 'no-scrollbar-cusdis'

    cusdisContainer.value.appendChild(cusdisEl)

    // 加载 Cusdis 脚本
    await loadScript()

    // 初始化完成后调整样式
    setTimeout(() => {
      removeScrollbars()
      updateCommentCount()
      checkScrollHint()
      setupResizeObserver()
    }, 1000)

  } catch (error) {
    console.error('Cusdis 初始化失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 生成标识符
const generateIdentifiers = () => {
  const pageId = route.path.replace(/^\//, '').replace(/\//g, '-') || 'home'
  const pageUrl = typeof window !== 'undefined'
      ? window.location.href
      : ''
  const pageTitle = frontmatter.value.title || title.value || 'Untitled'

  return { pageId, pageUrl, pageTitle }
}

// 加载脚本
const loadScript = () => {
  return new Promise((resolve, reject) => {
    // 移除旧的脚本
    const oldScript = document.getElementById('cusdis-noscroll-script')
    if (oldScript) oldScript.remove()

    // 创建新脚本
    const script = document.createElement('script')
    script.id = 'cusdis-noscroll-script'
    script.src = `${config.host}/js/cusdis.es.js`
    script.async = true

    script.onload = () => {
      console.log('Cusdis 加载成功')
      resolve()
    }

    script.onerror = reject

    document.head.appendChild(script)
  })
}

// 移除所有滚动条 - 核心功能
const removeScrollbars = () => {
  // 等待 DOM 完全渲染
  setTimeout(() => {
    // 1. 移除 Cusdis 默认的滚动条
    const cusdisThread = document.querySelector('#cusdis_thread')
    if (cusdisThread) {
      cusdisThread.style.overflow = 'hidden'
      cusdisThread.style.scrollbarWidth = 'none'
      cusdisThread.style.msOverflowStyle = 'none'
    }

    // 2. 移除所有 Cusdis 内部元素的滚动条
    document.querySelectorAll('.cds-comments, .cds-comment-list').forEach(el => {
      el.style.overflow = 'hidden'
      el.style.scrollbarWidth = 'none'
      el.style.msOverflowStyle = 'none'
    })

    // 3. 使用 CSS 类覆盖所有可能产生滚动条的元素
    const scrollableSelectors = [
      '#cusdis_thread',
      '.cds-comments',
      '.cds-comment-list',
      '.cds-comment-box',
      '.cds-comment-body'
    ]

    scrollableSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        el.classList.add('no-scrollbar')
      })
    })

    // 4. 确保容器可以正常显示内容
    if (contentWrapper.value) {
      contentWrapper.value.classList.add('scrollable-content')
    }

  }, 1500)
}

// 更新评论数量
const updateCommentCount = () => {
  setTimeout(() => {
    const comments = document.querySelectorAll('.cds-comment')
    commentCount.value = comments.length
  }, 1500)
}

// 检查是否需要显示滚动提示
const checkScrollHint = () => {
  setTimeout(() => {
    if (!contentWrapper.value) return

    const container = contentWrapper.value.querySelector('.cds-comments')
    if (container && container.scrollHeight > container.clientHeight) {
      showScrollHint.value = true
    }
  }, 2000)
}

// 滚动评论
const scrollComments = () => {
  if (!contentWrapper.value) return

  const container = contentWrapper.value.querySelector('.cds-comments')
  if (container) {
    container.scrollBy({
      top: 300,
      behavior: 'smooth'
    })

    // 隐藏提示
    showScrollHint.value = false
  }
}

// 设置 Resize Observer
const setupResizeObserver = () => {
  if (!contentWrapper.value || !window.ResizeObserver) return

  resizeObserver.value = new ResizeObserver(() => {
    removeScrollbars()
    checkScrollHint()
  })

  resizeObserver.value.observe(contentWrapper.value)
}

// 清理
const cleanup = () => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }

  const script = document.getElementById('cusdis-noscroll-script')
  if (script) script.remove()
}

// 生命周期
onMounted(() => {
  initCusdis()

  // 监听主题变化
  const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)')
  darkModeMedia.addEventListener('change', removeScrollbars)
})

onUnmounted(() => {
  cleanup()
})

// 路由变化时重新初始化
watch(() => route.path, () => {
  cleanup()
  initCusdis()
})
</script>

<style scoped>
/* 主容器 */
.no-scrollbar-comment-section {
  margin: 3rem 0;
  padding: 2rem;
  border-radius: 16px;
  background: var(--comment-bg, #f8fafc);
  border: 1px solid var(--comment-border, #e2e8f0);
  position: relative;
}

/* 头部样式 */
.comment-header {
  margin-bottom: 2rem;
  text-align: center;
}

.comment-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--comment-title-color, #1e293b);
  margin-bottom: 0.5rem;
}

.comment-icon {
  width: 28px;
  height: 28px;
  color: var(--comment-icon-color, #3b82f6);
}

.comment-count {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.comment-subtitle {
  color: var(--comment-subtitle-color, #64748b);
  font-size: 0.95rem;
  margin: 0;
}

/* 评论内容容器 - 无滚动条设计 */
.comment-content-wrapper {
  min-height: 200px;
  max-height: 800px;
  position: relative;
  padding-bottom: 1rem;
}

.comment-content-wrapper.scrollable-content {
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.comment-content-wrapper.scrollable-content::-webkit-scrollbar {
  display: none;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--loading-color, #64748b);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--spinner-bg, #e2e8f0);
  border-top-color: var(--spinner-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--empty-color, #94a3b8);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--empty-icon-color, #cbd5e1);
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

/* 滚动提示 */
.scroll-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top,
  var(--comment-bg, #f8fafc) 60%,
  transparent 100%);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.scroll-hint:hover {
  transform: translateY(-2px);
}

.hint-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem 1rem;
  background: var(--hint-bg, rgba(59, 130, 246, 0.1));
  border-radius: 8px;
  color: var(--hint-color, #3b82f6);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.scroll-hint:hover .hint-content {
  background: var(--hint-hover-bg, rgba(59, 130, 246, 0.2));
}

.hint-icon {
  width: 18px;
  height: 18px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}

/* Cusdis 容器 */
.cusdis-container {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .no-scrollbar-comment-section {
    padding: 1.5rem;
    margin: 2rem 0;
    border-radius: 12px;
  }

  .comment-content-wrapper {
    max-height: 600px;
  }

  .comment-title {
    font-size: 1.25rem;
  }

  .scroll-hint {
    padding: 0.75rem;
  }

  .hint-content {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
}

@media (max-width: 480px) {
  .no-scrollbar-comment-section {
    padding: 1rem;
    border-radius: 8px;
  }

  .comment-content-wrapper {
    max-height: 500px;
  }

  .comment-title {
    flex-direction: column;
    gap: 8px;
    font-size: 1.1rem;
  }
}
</style>

<style>
/* === 全局无滚动条样式 === */

/* 1. 隐藏所有 Cusdis 元素的滚动条 */
.no-scrollbar-cusdis,
#cusdis_thread,
.cds-comments,
.cds-comment-list,
.cds-comment-box,
.cds-comment-body {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.no-scrollbar-cusdis::-webkit-scrollbar,
#cusdis_thread::-webkit-scrollbar,
.cds-comments::-webkit-scrollbar,
.cds-comment-list::-webkit-scrollbar,
.cds-comment-box::-webkit-scrollbar,
.cds-comment-body::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

/* 2. 移除所有滚动相关样式 */
.no-scrollbar-cusdis *,
#cusdis_thread *,
.cds-comments *,
.cds-comment-list * {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.no-scrollbar-cusdis *::-webkit-scrollbar,
#cusdis_thread *::-webkit-scrollbar,
.cds-comments *::-webkit-scrollbar,
.cds-comment-list *::-webkit-scrollbar {
  display: none !important;
}

/* 3. 确保内容正常显示 */
.cds-comments {
  overflow: visible !important;
  max-height: none !important;
  height: auto !important;
  padding-right: 0 !important;
}

.cds-comment-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 1rem !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 4. 美化评论项 */
.cds-comment {
  border-radius: 12px !important;
  padding: 1.5rem !important;
  margin-bottom: 1rem !important;
  background: var(--comment-item-bg, white) !important;
  border: 1px solid var(--comment-item-border, #e2e8f0) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.dark .cds-comment {
  background: var(--comment-item-bg, #0f172a) !important;
  border-color: var(--comment-item-border, #334155) !important;
}

/* 5. 评论框美化 */
.cds-comment-box {
  border-radius: 12px !important;
  padding: 1.5rem !important;
  margin-top: 2rem !important;
  background: var(--comment-box-bg, white) !important;
  border: 1px solid var(--comment-box-border, #e2e8f0) !important;
}

.dark .cds-comment-box {
  background: var(--comment-box-bg, #0f172a) !important;
  border-color: var(--comment-box-border, #334155) !important;
}

/* 6. 输入框修复 */
.cds-textarea {
  min-height: 100px !important;
  max-height: 300px !important;
  resize: vertical !important;
  overflow-y: auto !important;
}

/* 7. 分页样式修复 */
.cds-pagination {
  margin-top: 2rem !important;
  padding-top: 1.5rem !important;
  border-top: 1px solid var(--pagination-border, #e2e8f0) !important;
  display: flex !important;
  justify-content: center !important;
  gap: 0.5rem !important;
}

.dark .cds-pagination {
  border-top-color: var(--pagination-border, #334155) !important;
}

/* 8. 强制移除所有可能的滚动容器 */
[style*="overflow"],
[style*="scrollbar"] {
  overflow: visible !important;
}

/* 9. 特定选择器覆盖 */
div[class*="scroll"],
div[class*="Scroll"] {
  overflow: visible !important;
}

/* 10. 使用 !important 确保样式优先级 */
body .cds-comments,
body #cusdis_thread,
body .no-scrollbar-cusdis {
  overflow: hidden !important;
  overflow-y: visible !important;
}

/* === 深色模式变量 === */
.dark {
  --comment-bg: #1e293b;
  --comment-border: #334155;
  --comment-title-color: #f1f5f9;
  --comment-icon-color: #60a5fa;
  --comment-subtitle-color: #94a3b8;
  --loading-color: #94a3b8;
  --spinner-bg: #334155;
  --spinner-color: #60a5fa;
  --empty-color: #94a3b8;
  --empty-icon-color: #475569;
  --hint-bg: rgba(96, 165, 250, 0.1);
  --hint-color: #60a5fa;
  --hint-hover-bg: rgba(96, 165, 250, 0.2);
  --comment-item-bg: #0f172a;
  --comment-item-border: #334155;
  --comment-box-bg: #0f172a;
  --comment-box-border: #334155;
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
