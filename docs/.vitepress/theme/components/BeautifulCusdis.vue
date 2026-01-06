<!-- .vitepress/theme/components/BeautifulCusdis.vue -->
<template>
  <div class="beautiful-comment-section" :class="{ 'loading': isLoading }">
    <!-- 评论标题区域 -->
    <div class="comment-header">
      <h3 class="comment-title">
        <svg class="comment-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
        <span class="comment-count" v-if="commentCount > 0">{{ commentCount }} 条评论</span>
        <span class="comment-count" v-else>暂无评论</span>
      </h3>
      <p class="comment-subtitle">留下你的想法，一起参与讨论</p>
    </div>

    <!-- 评论列表容器 -->
    <div class="comment-list-wrapper" ref="listWrapper">
      <div class="comment-list" ref="commentList">
        <!-- Cusdis 评论容器 -->
        <div ref="cusdisContainer" class="cusdis-container"></div>
      </div>

      <!-- 加载指示器 -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        <span>加载评论中...</span>
      </div>
    </div>

    <!-- 自定义加载更多按钮 -->
    <div v-if="showLoadMore" class="load-more-wrapper">
      <button @click="loadMoreComments" class="load-more-btn" :disabled="isLoadingMore">
        <svg v-if="isLoadingMore" class="loading-spinner" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.4 31.4" />
        </svg>
        <span v-else>
          <svg class="load-icon" viewBox="0 0 24 24">
            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
          </svg>
          加载更多评论
        </span>
      </button>
    </div>

    <!-- 回到顶部按钮 -->
    <button v-if="showScrollTop" @click="scrollToTop" class="scroll-top-btn">
      <svg viewBox="0 0 24 24">
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useRoute, useData } from 'vitepress'

const route = useRoute()
const { title, frontmatter, site } = useData()

// Refs
const cusdisContainer = ref(null)
const commentList = ref(null)
const listWrapper = ref(null)

// 状态
const isLoading = ref(false)
const isLoadingMore = ref(false)
const commentCount = ref(0)
const showLoadMore = ref(false)
const showScrollTop = ref(false)
const scrollObserver = ref(null)

// Cusdis 配置
const cusdisConfig = {
  appId: '20c62207-4689-4d4f-9702-fe99b144741a', // 从 Cusdis 后台获取
  host: 'https://cusdis.com',
  lang: 'zh-cn',
  theme: 'auto',
  attrs: {
    'data-page-id': '',
    'data-page-url': '',
    'data-page-title': '',
    'data-lazy': 'true', // 启用懒加载
    'data-pagination': 'true' // 启用分页
  }
}

// 生成标识符
const generateIdentifiers = () => {
  // 使用路径作为 pageId，确保唯一性
  let pageId = route.path.replace(/^\//, '').replace(/\//g, '-') || 'home'

  // 生成完整 URL
  const base = site.value.base || '/'
  const pageUrl = typeof window !== 'undefined'
      ? window.location.href
      : `${window.location.origin}${base}${route.path.replace(/^\//, '')}`

  // 生成页面标题
  const pageTitle = frontmatter.value.title || title.value || site.value.title || 'Untitled'

  return { pageId, pageUrl, pageTitle }
}

// 初始化 Cusdis
const initCusdis = async () => {
  if (!cusdisContainer.value) return

  isLoading.value = true

  try {
    // 清除旧内容
    cusdisContainer.value.innerHTML = ''

    // 生成标识符
    const { pageId, pageUrl, pageTitle } = generateIdentifiers()

    // 创建 Cusdis 容器
    const container = document.createElement('div')
    container.id = 'cusdis_thread'
    container.dataset.host = cusdisConfig.host
    container.dataset.appId = cusdisConfig.appId
    container.dataset.pageId = pageId
    container.dataset.pageUrl = pageUrl
    container.dataset.pageTitle = pageTitle
    container.dataset.theme = cusdisConfig.theme
    container.dataset.lazy = 'true'
    container.dataset.pagination = 'true'

    // 应用自定义样式类
    container.className = 'cusdis-thread'

    cusdisContainer.value.appendChild(container)

    // 动态加载 Cusdis 脚本
    await loadCusdisScript()

    // 监听 Cusdis 初始化完成
    setTimeout(() => {
      customizeCusdisStyles()
      updateCommentCount()
      setupScrollObserver()
    }, 1000)

  } catch (error) {
    console.error('Cusdis 初始化失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 加载 Cusdis 脚本
const loadCusdisScript = () => {
  return new Promise((resolve, reject) => {
    const scriptId = 'cusdis-beautiful-script'
    let script = document.getElementById(scriptId)

    if (script) {
      script.remove()
    }

    script = document.createElement('script')
    script.id = scriptId
    script.src = `${cusdisConfig.host}/js/cusdis.es.js`
    script.defer = true
    script.async = true

    script.onload = () => {
      console.log('Cusdis 脚本加载成功')
      resolve()
    }

    script.onerror = () => {
      console.error('Cusdis 脚本加载失败')
      reject()
    }

    document.head.appendChild(script)
  })
}

// 自定义 Cusdis 样式
const customizeCusdisStyles = () => {
  // 等待 DOM 更新
  nextTick(() => {
    // 添加自定义 CSS 类到 Cusdis 元素
    document.querySelectorAll('.cds-comment').forEach(comment => {
      comment.classList.add('beautiful-comment')
    })

    document.querySelectorAll('.cds-comment-header').forEach(header => {
      header.classList.add('beautiful-comment-header')
    })

    document.querySelectorAll('.cds-comment-body').forEach(body => {
      body.classList.add('beautiful-comment-body')
    })

    document.querySelectorAll('.cds-btn').forEach(btn => {
      btn.classList.add('beautiful-btn')
    })

    document.querySelectorAll('.cds-comment-box').forEach(box => {
      box.classList.add('beautiful-comment-box')
    })

    // 隐藏默认的滚动条
    const thread = document.querySelector('.cusdis-thread')
    if (thread) {
      thread.style.overflow = 'hidden'
    }
  })
}

// 更新评论数量
const updateCommentCount = () => {
  setTimeout(() => {
    const comments = document.querySelectorAll('.cds-comment')
    commentCount.value = comments.length
    showLoadMore.value = comments.length >= 5 // 假设每页显示5条
  }, 1500)
}

// 加载更多评论
const loadMoreComments = async () => {
  if (isLoadingMore.value) return

  isLoadingMore.value = true

  try {
    // 模拟加载更多（Cusdis 会自动处理分页）
    if (window.CUSDIS && window.CUSDIS.loadMore) {
      await window.CUSDIS.loadMore()

      // 更新评论数量
      setTimeout(() => {
        updateCommentCount()
        customizeCusdisStyles()
      }, 500)
    }
  } catch (error) {
    console.error('加载更多评论失败:', error)
  } finally {
    isLoadingMore.value = false
  }
}

// 设置滚动观察器
const setupScrollObserver = () => {
  if (!listWrapper.value) return

  scrollObserver.value = new IntersectionObserver((entries) => {
    showScrollTop.value = entries[0].intersectionRatio < 0.1
  }, { threshold: 0.1 })

  scrollObserver.value.observe(listWrapper.value)
}

// 滚动到顶部
const scrollToTop = () => {
  if (commentList.value) {
    commentList.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// 生命周期
onMounted(() => {
  initCusdis()

  // 监听系统主题变化
  const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)')
  darkModeMedia.addEventListener('change', customizeCusdisStyles)
})

onUnmounted(() => {
  if (scrollObserver.value) {
    scrollObserver.value.disconnect()
  }

  // 清理脚本
  const script = document.getElementById('cusdis-beautiful-script')
  if (script) script.remove()
})

// 监听路由变化
watch(() => route.path, () => {
  initCusdis()
})
</script>

<style scoped>
.beautiful-comment-section {
  margin: 3rem 0;
  padding: 2rem;
  border-radius: 16px;
  background: var(--comment-bg, #f8fafc);
  border: 1px solid var(--comment-border, #e2e8f0);
  transition: all 0.3s ease;
  position: relative;
}

.beautiful-comment-section.loading {
  opacity: 0.7;
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

/* 评论列表容器 */
.comment-list-wrapper {
  position: relative;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 1.5rem;
}

/* 隐藏滚动条 */
.comment-list-wrapper::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

.comment-list-wrapper {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.comment-list {
  padding: 1rem 0;
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--loading-color, #64748b);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--spinner-bg, #e2e8f0);
  border-top-color: var(--spinner-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 加载更多按钮 */
.load-more-wrapper {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.75rem 1.5rem;
  background: var(--load-more-bg, linear-gradient(135deg, #3b82f6, #8b5cf6));
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.load-more-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
}

.load-more-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.load-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.load-more-btn:hover .load-icon {
  transform: translateY(2px);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

/* 回到顶部按钮 */
.scroll-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  background: var(--scroll-top-bg, linear-gradient(135deg, #3b82f6, #8b5cf6));
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.3s ease forwards;
}

.scroll-top-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.scroll-top-btn svg {
  width: 24px;
  height: 24px;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Cusdis 容器 */
.cusdis-container {
  min-height: 200px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .beautiful-comment-section {
    padding: 1.5rem;
    margin: 2rem 0;
    border-radius: 12px;
  }

  .comment-title {
    font-size: 1.25rem;
  }

  .comment-list-wrapper {
    max-height: 500px;
  }

  .load-more-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  .scroll-top-btn {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 44px;
    height: 44px;
  }
}

@media (max-width: 480px) {
  .beautiful-comment-section {
    padding: 1rem;
    border-radius: 8px;
  }

  .comment-title {
    font-size: 1.1rem;
    flex-direction: column;
    gap: 8px;
  }

  .comment-list-wrapper {
    max-height: 400px;
  }
}
</style>

<style>
/* 全局 CSS 变量 */
:root {
  --comment-bg: #f8fafc;
  --comment-border: #e2e8f0;
  --comment-title-color: #1e293b;
  --comment-icon-color: #3b82f6;
  --comment-subtitle-color: #64748b;
  --loading-color: #64748b;
  --spinner-bg: #e2e8f0;
  --spinner-color: #3b82f6;
  --load-more-bg: linear-gradient(135deg, #3b82f6, #8b5cf6);
  --scroll-top-bg: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.dark {
  --comment-bg: #1e293b;
  --comment-border: #334155;
  --comment-title-color: #f1f5f9;
  --comment-icon-color: #60a5fa;
  --comment-subtitle-color: #94a3b8;
  --loading-color: #94a3b8;
  --spinner-bg: #334155;
  --spinner-color: #60a5fa;
  --load-more-bg: linear-gradient(135deg, #60a5fa, #a78bfa);
  --scroll-top-bg: linear-gradient(135deg, #60a5fa, #a78bfa);
}

/* 美化 Cusdis 默认样式 */
.cusdis-thread {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.cusdis-thread::-webkit-scrollbar {
  display: none !important;
}

/* 评论项美化 */
.beautiful-comment {
  background: var(--comment-item-bg, white) !important;
  border: 1px solid var(--comment-item-border, #e2e8f0) !important;
  border-radius: 12px !important;
  padding: 1.5rem !important;
  margin-bottom: 1.25rem !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.dark .beautiful-comment {
  background: var(--comment-item-bg, #0f172a) !important;
  border-color: var(--comment-item-border, #334155) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.beautiful-comment:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1) !important;
}

/* 评论头部美化 */
.beautiful-comment-header {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  margin-bottom: 1rem !important;
  padding-bottom: 0.75rem !important;
  border-bottom: 1px solid var(--comment-header-border, #f1f5f9) !important;
}

.dark .beautiful-comment-header {
  border-bottom-color: var(--comment-header-border, #334155) !important;
}

/* 评论人头像美化 */
.cds-comment-avatar {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  border: 2px solid var(--avatar-border, #3b82f6) !important;
  padding: 2px !important;
  background: white !important;
}

/* 评论人信息美化 */
.cds-comment-author {
  font-weight: 600 !important;
  color: var(--author-color, #1e293b) !important;
  font-size: 0.95rem !important;
}

.dark .cds-comment-author {
  color: var(--author-color, #f1f5f9) !important;
}

.cds-comment-time {
  color: var(--time-color, #64748b) !important;
  font-size: 0.85rem !important;
}

/* 评论内容美化 */
.beautiful-comment-body {
  color: var(--comment-body-color, #334155) !important;
  line-height: 1.6 !important;
  font-size: 0.95rem !important;
  margin: 0 !important;
}

.dark .beautiful-comment-body {
  color: var(--comment-body-color, #cbd5e1) !important;
}

/* 评论框美化 */
.beautiful-comment-box {
  background: var(--comment-box-bg, white) !important;
  border: 1px solid var(--comment-box-border, #e2e8f0) !important;
  border-radius: 12px !important;
  padding: 1.5rem !important;
  margin-top: 2rem !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;
}

.dark .beautiful-comment-box {
  background: var(--comment-box-bg, #0f172a) !important;
  border-color: var(--comment-box-border, #334155) !important;
}

/* 输入框美化 */
.cds-textarea {
  background: var(--textarea-bg, #f8fafc) !important;
  border: 1px solid var(--textarea-border, #e2e8f0) !important;
  border-radius: 8px !important;
  padding: 0.875rem !important;
  color: var(--textarea-color, #1e293b) !important;
  font-size: 0.95rem !important;
  transition: all 0.3s ease !important;
}

.dark .cds-textarea {
  background: var(--textarea-bg, #1e293b) !important;
  border-color: var(--textarea-border, #475569) !important;
  color: var(--textarea-color, #f1f5f9) !important;
}

.cds-textarea:focus {
  outline: none !important;
  border-color: var(--textarea-focus-border, #3b82f6) !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

/* 按钮美化 */
.beautiful-btn {
  background: var(--btn-bg, linear-gradient(135deg, #3b82f6, #8b5cf6)) !important;
  color: white !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 0.75rem 1.5rem !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
}

.beautiful-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
}

.beautiful-btn:active {
  transform: translateY(0) !important;
}

/* 回复按钮美化 */
.cds-btn-reply {
  background: transparent !important;
  color: var(--reply-color, #3b82f6) !important;
  padding: 0.375rem 0.75rem !important;
  border: 1px solid var(--reply-border, #3b82f6) !important;
}

.cds-btn-reply:hover {
  background: rgba(59, 130, 246, 0.1) !important;
}

/* 分页样式美化 */
.cds-pagination {
  display: flex !important;
  justify-content: center !important;
  gap: 8px !important;
  margin-top: 2rem !important;
  padding-top: 1.5rem !important;
  border-top: 1px solid var(--pagination-border, #e2e8f0) !important;
}

.dark .cds-pagination {
  border-top-color: var(--pagination-border, #334155) !important;
}

.cds-pagination-btn {
  min-width: 40px !important;
  height: 40px !important;
  border-radius: 8px !important;
  border: 1px solid var(--pagination-btn-border, #e2e8f0) !important;
  background: var(--pagination-btn-bg, white) !important;
  color: var(--pagination-btn-color, #64748b) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 0.9rem !important;
  transition: all 0.3s ease !important;
}

.dark .cds-pagination-btn {
  border-color: var(--pagination-btn-border, #475569) !important;
  background: var(--pagination-btn-bg, #1e293b) !important;
  color: var(--pagination-btn-color, #94a3b8) !important;
}

.cds-pagination-btn:hover {
  background: var(--pagination-btn-hover-bg, #f1f5f9) !important;
  border-color: var(--pagination-btn-hover-border, #3b82f6) !important;
  color: var(--pagination-btn-hover-color, #3b82f6) !important;
}

.dark .cds-pagination-btn:hover {
  background: var(--pagination-btn-hover-bg, #334155) !important;
}

.cds-pagination-btn.active {
  background: var(--pagination-btn-active-bg, #3b82f6) !important;
  border-color: #3b82f6 !important;
  color: white !important;
}

/* 加载更多动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .beautiful-comment {
    padding: 1.25rem !important;
  }

  .beautiful-comment-box {
    padding: 1.25rem !important;
  }

  .cds-comment-avatar {
    width: 36px !important;
    height: 36px !important;
  }

  .cds-textarea {
    font-size: 0.9rem !important;
    padding: 0.75rem !important;
  }

  .beautiful-btn {
    padding: 0.6rem 1.25rem !important;
    font-size: 0.85rem !important;
  }
}

@media (max-width: 480px) {
  .beautiful-comment {
    padding: 1rem !important;
  }

  .beautiful-comment-box {
    padding: 1rem !important;
  }

  .beautiful-comment-header {
    flex-wrap: wrap !important;
  }

  .cds-pagination-btn {
    min-width: 36px !important;
    height: 36px !important;
    font-size: 0.85rem !important;
  }
}
</style>
