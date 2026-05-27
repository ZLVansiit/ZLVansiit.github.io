<template>
  <div class="moments-page">
    <!-- 封面区：昵称在右、头像贴封面右下角 -->
    <header class="moments-header">
      <div class="cover-wrap">
        <div class="cover-media">
          <img
            v-if="profile.cover && !coverBroken"
            :src="profile.cover"
            alt=""
            class="cover-img"
            @error="onCoverError"
          />
          <div v-else class="cover-fallback" />
        </div>

        <div class="cover-toolbar">
          <a class="toolbar-btn" href="/" aria-label="返回">‹</a>
          <button type="button" class="toolbar-btn toolbar-camera" aria-label="发布">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
              <path
                d="M5 7h2l1.2-1.6a1 1 0 0 1 .8-.4h6a1 1 0 0 1 .8.4L17 7h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"
              />
              <circle cx="12" cy="13" r="3.2" />
            </svg>
          </button>
        </div>

        <div class="cover-profile">
          <span class="cover-name">{{ profile.name }}</span>
          <img class="cover-avatar" :src="profile.avatar" :alt="profile.name" />
        </div>
      </div>
    </header>

    <!-- 动态列表 -->
    <section class="moments-feed">
      <p v-if="loading" class="feed-status">加载中...</p>
      <p v-else-if="errorMessage" class="feed-status feed-status-error">{{ errorMessage }}</p>
      <p v-else-if="!posts.length" class="feed-status">暂无动态</p>
      <p v-else-if="usingMock" class="feed-mock-hint">开发预览 · Mock 数据（12 条，覆盖各布局）</p>
      <article v-for="post in posts" :key="post.id" class="moment-item">
        <img class="moment-avatar" :src="profile.avatar" :alt="profile.name" />
        <div class="moment-body">
          <div class="moment-name">{{ profile.name }}</div>

          <div v-if="post.content" class="moment-text-wrap">
            <p class="moment-content">
              {{ displayContent(post) }}
              <button
                v-if="needExpand(post) && !isExpanded(post.id)"
                type="button"
                class="link-full"
                @click="expandPost(post.id)"
              >
                全文
              </button>
            </p>
          </div>

          <div
            v-if="post.media?.length"
            class="media-grid"
            :class="mediaGridClass(post.media.length)"
          >
            <div
              v-for="(item, index) in post.media.slice(0, 9)"
              :key="`${post.id}-${index}`"
              class="media-cell"
              @click="openPreview(post, index)"
            >
              <img
                :src="item.poster || item.src"
                alt=""
                class="media-img"
                loading="lazy"
              />
              <span
                v-if="item.type === 'live'"
                class="live-badge"
                aria-label="实况照片"
              >
                <svg class="live-badge-icon" viewBox="0 0 17 17" aria-hidden="true">
                  <circle cx="8.5" cy="8.5" r="7" fill="none" stroke="currentColor" stroke-width="1.25" />
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="4.25"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.25"
                    stroke-dasharray="2.2 1.35"
                  />
                  <circle cx="8.5" cy="8.5" r="1.15" fill="currentColor" />
                </svg>
                <span class="live-badge-text">LIVE</span>
              </span>
            </div>
          </div>

          <div class="moment-footer">
            <div class="moment-meta">
              <time>{{ formatRelativeTime(post.time) }}</time>
              <span v-if="post.location" class="location">{{ post.location }}</span>
            </div>
            <button
              type="button"
              class="action-btn"
              :class="{ active: activeMenuId === post.id }"
              aria-label="互动"
              @click.stop="toggleMenu(post.id)"
            >
              ···
            </button>
            <div v-if="activeMenuId === post.id" class="action-popover" @click.stop>
              <button type="button" class="popover-item">赞</button>
              <button type="button" class="popover-item">评论</button>
            </div>
          </div>
        </div>
      </article>
    </section>

    <Teleport to="body">
      <!-- 图片：全屏预览 -->
      <Transition name="preview-fade">
        <div
          v-if="previewVisible && previewMode === 'image'"
          class="preview-mask"
          role="dialog"
          aria-modal="true"
          aria-label="图片预览"
          @click="closePreview"
        >
          <button type="button" class="preview-back" aria-label="关闭" @click.stop="closePreview">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <div class="preview-body">
            <img :src="previewSrc" alt="" class="preview-img" @click.stop />
          </div>
        </div>
      </Transition>

      <!-- Live：半屏底部弹框 -->
      <Transition name="live-sheet">
        <div
          v-if="previewVisible && previewMode === 'live'"
          class="live-sheet-mask"
          role="dialog"
          aria-modal="true"
          aria-label="实况预览"
          @click="closePreview"
        >
          <div class="live-sheet-panel" @click.stop>
            <button type="button" class="preview-back live-sheet-back" aria-label="关闭" @click.stop="closePreview">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  d="M15 6l-6 6 6 6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <div class="live-preview" @click="closePreview">
              <img
                v-if="previewPoster"
                :src="previewPoster"
                alt=""
                class="preview-img live-poster"
                :class="{ 'is-hidden': liveVideoPlaying }"
              />
              <video
                ref="previewVideoRef"
                class="preview-video live-video"
                :class="{ 'is-visible': liveVideoPlaying }"
                :src="previewSrc"
                playsinline
                webkit-playsinline
                muted
                preload="auto"
                @canplay="onLiveCanPlay"
                @playing="onLivePlaying"
                @ended="onLiveEnded"
                @waiting="liveLoading = true"
              />
              <div v-if="liveLoading" class="live-preview-loading" aria-hidden="true">
                <span class="live-spinner" />
              </div>
              <span v-if="liveVideoPlaying" class="live-preview-badge" aria-hidden="true">
                <svg class="live-badge-icon" viewBox="0 0 17 17">
                  <circle cx="8.5" cy="8.5" r="7" fill="none" stroke="currentColor" stroke-width="1.25" />
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="4.25"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.25"
                    stroke-dasharray="2.2 1.35"
                  />
                  <circle cx="8.5" cy="8.5" r="1.15" fill="currentColor" />
                </svg>
                <span class="live-badge-text">LIVE</span>
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { fetchMomentsFeed, isMomentsMockMode } from '../api/momentsApi'

const CONTENT_LIMIT = 140

const profile = ref({ name: 'Vansiit', avatar: '/img/logo.svg', cover: '/moments/cover.jpg' })
const posts = ref([])
const loading = ref(false)
const errorMessage = ref('')
const usingMock = ref(isMomentsMockMode)
const coverBroken = ref(false)
const expandedIds = ref(new Set())
const activeMenuId = ref(null)

const onCoverError = () => {
  coverBroken.value = true
}

const needExpand = (post) => (post.content?.length || 0) > CONTENT_LIMIT
const isExpanded = (id) => expandedIds.value.has(String(id))
const expandPost = (id) => {
  expandedIds.value = new Set([...expandedIds.value, String(id)])
}
const displayContent = (post) => {
  if (!post.content) return ''
  if (!needExpand(post) || isExpanded(post.id)) return post.content
  return `${post.content.slice(0, CONTENT_LIMIT)}...`
}

const mediaGridClass = (count) => {
  const n = Math.min(count, 9)
  if (n === 1) return 'media-count-1'
  if (n === 2) return 'media-count-2'
  if (n === 4) return 'media-count-4'
  return 'media-count-multi'
}

const formatRelativeTime = (timeStr) => {
  const parsed = parseTime(timeStr)
  if (!parsed) return timeStr
  const diffMs = Date.now() - parsed.getTime()
  if (diffMs < 0) return timeStr
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  const month = parsed.getMonth() + 1
  const day = parsed.getDate()
  return `${month}月${day}日`
}

const parseTime = (timeStr) => {
  if (!timeStr) return null
  const normalized = timeStr.replace(/-/g, '/')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

const previewVisible = ref(false)
const previewMode = ref('image')
const previewSrc = ref('')
const previewPoster = ref('')
const previewVideoRef = ref(null)
const liveVideoPlaying = ref(false)
const liveLoading = ref(false)
let livePlayTimer = null
let livePlayStarted = false

const resetLivePreviewState = () => {
  liveVideoPlaying.value = false
  liveLoading.value = false
  livePlayStarted = false
  if (livePlayTimer) {
    clearTimeout(livePlayTimer)
    livePlayTimer = null
  }
  const video = previewVideoRef.value
  if (video) {
    video.pause()
    video.currentTime = 0
  }
}

const startLivePlayback = async () => {
  if (livePlayStarted || previewMode.value !== 'live' || !previewVisible.value) return
  const video = previewVideoRef.value
  if (!video) return
  livePlayStarted = true
  liveLoading.value = true
  try {
    video.currentTime = 0
    video.loop = false
    video.muted = true
    await video.play()
  } catch {
    livePlayStarted = false
    liveLoading.value = false
  }
}

const onLiveCanPlay = () => {
  if (previewMode.value !== 'live' || liveVideoPlaying.value) return
  startLivePlayback()
}

const onLivePlaying = () => {
  liveLoading.value = false
  liveVideoPlaying.value = true
}

/** 播放结束后回到封面静帧，与微信实况浏览一致 */
const onLiveEnded = () => {
  liveVideoPlaying.value = false
  const video = previewVideoRef.value
  if (video) {
    video.pause()
    video.currentTime = 0
  }
}

const openPreview = (post, index) => {
  const item = post.media?.[index]
  if (!item) return
  resetLivePreviewState()
  if (item.type === 'live') {
    previewMode.value = 'live'
    previewSrc.value = item.src
    previewPoster.value = item.poster || ''
    previewVisible.value = true
    liveLoading.value = true
    // 先展示封面静帧，再播放实况（微信约 150ms 后开播）
    nextTick(() => {
      livePlayTimer = setTimeout(() => {
        startLivePlayback()
      }, 160)
    })
    return
  }
  previewMode.value = 'image'
  previewSrc.value = item.src
  previewPoster.value = ''
  previewVisible.value = true
}

const closePreview = () => {
  resetLivePreviewState()
  previewVisible.value = false
}

const onPreviewKeydown = (event) => {
  if (event.key === 'Escape' && previewVisible.value) {
    closePreview()
  }
}

watch(previewVisible, (visible) => {
  document.body.style.overflow = visible ? 'hidden' : ''
  if (visible) {
    document.addEventListener('keydown', onPreviewKeydown)
  } else {
    document.removeEventListener('keydown', onPreviewKeydown)
  }
})

const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

const closeMenuOnClickOutside = () => {
  activeMenuId.value = null
}

const loadFeed = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await fetchMomentsFeed()
    profile.value = data.profile
    posts.value = data.list
  } catch {
    errorMessage.value = '加载失败，请稍后重试'
    posts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenuOnClickOutside)
  loadFeed()
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenuOnClickOutside)
  document.removeEventListener('keydown', onPreviewKeydown)
  document.body.style.overflow = ''
  resetLivePreviewState()
})
</script>

<style scoped>
.moments-page {
  --moments-width: 480px;
  width: var(--moments-width);
  min-width: var(--moments-width);
  max-width: var(--moments-width);
  margin: 0 auto;
  background: #fff;
  min-height: 100vh;
  flex-shrink: 0;
  overflow: visible;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei',
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ---------- 封面 ---------- */
.moments-header {
  margin-bottom: 0;
  overflow: visible;
}

.cover-wrap {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: visible;
  background: transparent;
}

.cover-media {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #d8d8d8;
}

.cover-img,
.cover-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-fallback {
  background: linear-gradient(160deg, #6b7f9a 0%, #9aabbf 45%, #c5d0de 100%);
}

.cover-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  z-index: 2;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 1.75rem;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}

.toolbar-camera {
  font-size: 1.35rem;
  font-weight: 300;
}

.cover-profile {
  position: absolute;
  right: 16px;
  bottom: -36px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  z-index: 3;
  pointer-events: none;
}

.cover-profile .cover-avatar {
  pointer-events: auto;
}

.cover-name {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.3;
  padding-bottom: 42px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
  max-width: 200px;
  text-align: right;
}

.cover-avatar {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  object-fit: cover;
  background: #f0f0f0;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

/* ---------- 动态列表 ---------- */
.moments-feed {
  padding: 44px 0 24px;
  background: #fff;
  position: relative;
  z-index: 1;
}

.feed-status {
  margin: 0;
  padding: 24px 16px;
  text-align: center;
  font-size: 14px;
  color: #b2b2b2;
}

.feed-status-error {
  color: #b91c1c;
}

.feed-mock-hint {
  margin: 0;
  padding: 10px 16px 0;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
}

.moment-item {
  display: flex;
  gap: 10px;
  padding: 14px 16px 16px;
  border-bottom: 1px solid #ebebeb;
}

.moment-item:last-child {
  border-bottom: 0;
}

.moment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f2f2f2;
}

.moment-body {
  flex: 1;
  min-width: 0;
}

.moment-name {
  font-size: 15px;
  font-weight: 500;
  color: #576b95;
  line-height: 1.3;
  margin-bottom: 6px;
}

.moment-text-wrap {
  margin-bottom: 6px;
}

.moment-content {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: #191919;
  white-space: pre-wrap;
  word-break: break-word;
}

.link-full {
  border: 0;
  padding: 0;
  margin: 0;
  background: none;
  color: #576b95;
  font-size: 15px;
  cursor: pointer;
}

/* 图片宫格 */
.media-grid {
  display: grid;
  gap: 4px;
  margin: 6px 0 8px;
}

.media-count-1 {
  display: block;
  max-width: 180px;
}

.media-count-1 .media-cell {
  width: 100%;
  max-height: 280px;
  aspect-ratio: auto;
}

.media-count-1 .media-img {
  width: 100%;
  height: auto;
  max-height: 280px;
  object-fit: cover;
}

.media-count-2 {
  grid-template-columns: repeat(2, 96px);
  max-width: 196px;
}

.media-count-4 {
  grid-template-columns: repeat(2, 96px);
  max-width: 196px;
}

.media-count-multi {
  grid-template-columns: repeat(3, 96px);
  max-width: 296px;
}

.media-cell {
  position: relative;
  width: 96px;
  height: 96px;
  overflow: hidden;
  background: #f2f2f2;
  cursor: pointer;
}

.media-count-1 .media-cell {
  width: 100%;
  height: auto;
  min-height: 96px;
}

.media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* iOS 相册缩略图默认 LIVE 标记 */
.live-badge {
  position: absolute;
  left: 6px;
  top: 6px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 18px;
  padding: 0 6px 0 4px;
  border-radius: 999px;
  color: #fff;
  background: rgba(60, 60, 67, 0.55);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  backdrop-filter: blur(12px) saturate(180%);
  box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.12) inset;
  pointer-events: none;
  user-select: none;
}

.live-badge-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.live-badge-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1;
}

.media-count-1 .live-badge {
  left: 10px;
  top: 10px;
  height: 22px;
  padding: 0 8px 0 6px;
  gap: 4px;
}

.media-count-1 .live-badge-icon {
  width: 15px;
  height: 15px;
}

.media-count-1 .live-badge-text {
  font-size: 11px;
}

/* 时间 + 两点菜单 */
.moment-footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.moment-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #b2b2b2;
  line-height: 1.4;
}

.location::before {
  content: '';
}

.action-btn {
  flex-shrink: 0;
  width: 32px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: #f7f7f7;
  color: #576b95;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 20px;
  cursor: pointer;
}

.action-btn.active {
  background: #ededed;
}

.action-popover {
  position: absolute;
  right: 0;
  bottom: 28px;
  display: flex;
  align-items: center;
  background: #4c4c4c;
  border-radius: 4px;
  padding: 0 4px;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-popover::after {
  content: '';
  position: absolute;
  right: 10px;
  bottom: -5px;
  border: 5px solid transparent;
  border-top-color: #4c4c4c;
  border-bottom: 0;
}

.popover-item {
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 13px;
  padding: 10px 16px;
  cursor: pointer;
  white-space: nowrap;
}

.popover-item + .popover-item {
  border-left: 1px solid rgba(255, 255, 255, 0.12);
}

.popover-item:hover {
  opacity: 0.9;
}

/* 图片全屏预览 */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.22s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

.preview-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

/* Live 半屏弹框 */
.live-sheet-enter-active,
.live-sheet-leave-active {
  transition: opacity 0.22s ease;
}

.live-sheet-enter-active .live-sheet-panel,
.live-sheet-leave-active .live-sheet-panel {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.live-sheet-enter-from,
.live-sheet-leave-to {
  opacity: 0;
}

.live-sheet-enter-from .live-sheet-panel,
.live-sheet-leave-to .live-sheet-panel {
  transform: scale(0.94) translateY(10px);
  opacity: 0.6;
}

.live-sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.45);
  cursor: zoom-out;
}

.live-sheet-panel {
  --live-sheet-width: min(480px, 100%);
  position: relative;
  width: var(--live-sheet-width);
  height: min(50vh, 50dvh);
  min-height: 240px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  cursor: default;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.live-sheet-back {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  margin: 0;
}

.preview-back {
  position: absolute;
  top: env(safe-area-inset-top, 0);
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 4px 0 0 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
  opacity: 0.92;
}

.preview-back:active {
  opacity: 0.65;
}

.preview-body {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.preview-img {
  max-width: 100%;
  max-height: 100vh;
  object-fit: contain;
  pointer-events: auto;
  user-select: none;
  -webkit-user-drag: none;
  cursor: default;
}

/* Live 实况：模块内 100% 铺满（半屏居中弹框） */
.live-sheet-panel .live-preview {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: zoom-out;
}

.live-sheet-panel .live-poster,
.live-sheet-panel .live-video {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  object-fit: cover;
  transition: opacity 0.28s ease;
}

.live-poster.is-hidden {
  opacity: 0;
}

.live-video {
  z-index: 0;
  opacity: 0;
}

.live-video.is-visible {
  opacity: 1;
  z-index: 2;
}

.live-preview-loading {
  position: absolute;
  z-index: 3;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.live-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: live-spin 0.75s linear infinite;
}

@keyframes live-spin {
  to {
    transform: rotate(360deg);
  }
}

.live-preview-badge {
  position: absolute;
  left: 12px;
  top: 52px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 20px;
  padding: 0 7px 0 5px;
  border-radius: 999px;
  color: #fff;
  background: rgba(60, 60, 67, 0.55);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  backdrop-filter: blur(12px) saturate(180%);
  pointer-events: none;
  animation: live-badge-pulse 1.6s ease-in-out infinite;
}

@keyframes live-badge-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.72;
  }
}

.live-preview-badge .live-badge-icon {
  width: 14px;
  height: 14px;
}

.live-preview-badge .live-badge-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

@media (max-width: 520px) {
  .moments-page {
    --moments-width: 100%;
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  .cover-wrap {
    height: 260px;
  }

  .live-sheet-mask {
    padding: 12px;
  }

  .live-sheet-panel {
    --live-sheet-width: 100%;
    width: 100%;
    min-height: 200px;
  }
}
</style>
