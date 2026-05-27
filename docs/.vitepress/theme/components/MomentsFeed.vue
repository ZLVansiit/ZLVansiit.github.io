<template>
  <div class="moments-page">
    <!-- 封面区：昵称在右、头像贴封面右下角 -->
    <header class="moments-header">
      <div class="cover-wrap">
        <img
          v-if="profile.cover && !coverBroken"
          :src="profile.cover"
          alt=""
          class="cover-img"
          @error="onCoverError"
        />
        <div v-else class="cover-fallback" />

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
              <span v-if="item.type === 'live'" class="live-badge">LIVE</span>
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
      <div v-if="previewVisible" class="preview-mask" @click.self="closePreview">
        <button type="button" class="preview-close" aria-label="关闭" @click="closePreview">×</button>
        <div class="preview-body">
          <img v-if="previewMode === 'image'" :src="previewSrc" alt="" class="preview-img" />
          <video
            v-else
            ref="previewVideoRef"
            class="preview-video"
            :src="previewSrc"
            :poster="previewPoster"
            controls
            playsinline
            autoplay
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { fetchMomentsFeed } from '../api/momentsApi'

const CONTENT_LIMIT = 140

const profile = ref({ name: '张磊', avatar: '/img/logo.svg', cover: '/moments/cover.jpg' })
const posts = ref([])
const loading = ref(false)
const errorMessage = ref('')
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

const openPreview = (post, index) => {
  const item = post.media?.[index]
  if (!item) return
  if (item.type === 'live') {
    previewMode.value = 'live'
    previewSrc.value = item.src
    previewPoster.value = item.poster || ''
  } else {
    previewMode.value = 'image'
    previewSrc.value = item.src
    previewPoster.value = ''
  }
  previewVisible.value = true
  nextTick(() => previewVideoRef.value?.play?.())
}

const closePreview = () => {
  previewVisible.value = false
  previewVideoRef.value?.pause?.()
}

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
  } catch (error) {
    errorMessage.value = error?.message || '朋友圈加载失败'
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
})
</script>

<style scoped>
.moments-page {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background: #fff;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei',
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ---------- 封面 ---------- */
.moments-header {
  margin-bottom: 0;
}

.cover-wrap {
  position: relative;
  width: 100%;
  height: 300px;
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
  bottom: -24px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  z-index: 2;
}

.cover-name {
  color: #fff;
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.3;
  padding-bottom: 8px;
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
}

/* ---------- 动态列表 ---------- */
.moments-feed {
  padding: 36px 0 24px;
  background: #fff;
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

.live-badge {
  position: absolute;
  left: 4px;
  top: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
  padding: 1px 5px;
  border-radius: 2px;
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

/* 预览 */
.preview-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-close {
  position: absolute;
  top: 12px;
  right: 16px;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  z-index: 1;
}

.preview-img,
.preview-video {
  max-width: 100%;
  max-height: 100vh;
  object-fit: contain;
}

@media (max-width: 768px) {
  .moments-page {
    max-width: 100%;
  }

  .cover-wrap {
    height: 260px;
  }
}
</style>
