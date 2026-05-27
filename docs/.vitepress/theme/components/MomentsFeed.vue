<template>
  <div class="moments-page">
    <header class="moments-header">
      <div class="cover" :style="coverStyle">
        <img v-if="profile.cover" :src="profile.cover" alt="" class="cover-img" @error="onCoverError" />
      </div>
      <div class="profile-bar">
        <img class="avatar" :src="profile.avatar" :alt="profile.name" />
        <div class="profile-text">
          <h1 class="profile-name">{{ profile.name }}</h1>
          <p v-if="profile.signature" class="profile-sign">{{ profile.signature }}</p>
        </div>
      </div>
    </header>

    <section class="moments-feed">
      <article v-for="post in posts" :key="post.id" class="moment-item">
        <img class="moment-avatar" :src="profile.avatar" :alt="profile.name" />
        <div class="moment-body">
          <div class="moment-name">{{ profile.name }}</div>
          <p v-if="post.content" class="moment-content">{{ post.content }}</p>

          <div
            v-if="post.media?.length"
            class="media-grid"
            :class="`media-count-${Math.min(post.media.length, 9)}`"
          >
            <div
              v-for="(item, index) in post.media.slice(0, 9)"
              :key="`${post.id}-${index}`"
              class="media-cell"
              @click="openPreview(post, index)"
            >
              <img
                v-if="item.type === 'image' || item.poster"
                :src="item.poster || item.src"
                alt=""
                class="media-img"
                loading="lazy"
              />
              <img
                v-else-if="item.type === 'live'"
                :src="profile.avatar"
                alt=""
                class="media-img"
                loading="lazy"
              />
              <span v-if="item.type === 'live'" class="live-badge">LIVE</span>
            </div>
          </div>

          <footer class="moment-meta">
            <time>{{ post.time }}</time>
            <span v-if="post.location" class="location">{{ post.location }}</span>
          </footer>
        </div>
      </article>
    </section>

    <Teleport to="body">
      <div v-if="previewVisible" class="preview-mask" @click.self="closePreview">
        <button type="button" class="preview-close" aria-label="关闭" @click="closePreview">×</button>
        <div class="preview-body">
          <img
            v-if="previewMode === 'image'"
            :src="previewSrc"
            alt=""
            class="preview-img"
          />
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
        <p v-if="previewCaption" class="preview-caption">{{ previewCaption }}</p>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { momentsPosts, momentsProfile } from '../data/moments'

const profile = momentsProfile
const posts = momentsPosts
const coverBroken = ref(false)

const coverStyle = computed(() => {
  if (!profile.cover || coverBroken.value) {
    return { background: 'linear-gradient(135deg, #576b95 0%, #7b8eb8 100%)' }
  }
  return {}
})

const onCoverError = () => {
  coverBroken.value = true
}

const previewVisible = ref(false)
const previewMode = ref('image')
const previewSrc = ref('')
const previewPoster = ref('')
const previewCaption = ref('')
const previewVideoRef = ref(null)

const openPreview = (post, index) => {
  const item = post.media?.[index]
  if (!item) return
  previewCaption.value = post.content || ''
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
  nextTick(() => {
    previewVideoRef.value?.play?.()
  })
}

const closePreview = () => {
  previewVisible.value = false
  if (previewVideoRef.value) {
    previewVideoRef.value.pause()
  }
}
</script>

<style scoped>
.moments-page {
  max-width: 680px;
  margin: 0 auto;
  background: #ededed;
  min-height: 60vh;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.moments-header {
  background: #fff;
  margin-bottom: 8px;
}

.cover {
  height: 220px;
  overflow: hidden;
  position: relative;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-bar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 0 16px 16px;
  margin-top: -36px;
  position: relative;
  z-index: 1;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  border: 3px solid #fff;
  background: #fff;
  object-fit: cover;
  flex-shrink: 0;
}

.profile-text {
  flex: 1;
  min-width: 0;
  padding-bottom: 4px;
}

.profile-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #191919;
}

.profile-sign {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #888;
}

.moments-feed {
  background: #fff;
}

.moment-item {
  display: flex;
  gap: 10px;
  padding: 16px 16px 14px;
  border-bottom: 1px solid #f0f0f0;
}

.moment-item:last-child {
  border-bottom: 0;
}

.moment-avatar {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f2f2f2;
}

.moment-body {
  flex: 1;
  min-width: 0;
}

.moment-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #576b95;
  margin-bottom: 6px;
}

.moment-content {
  margin: 0 0 8px;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #191919;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 微信朋友圈图片宫格 */
.media-grid {
  display: grid;
  gap: 4px;
  margin-bottom: 8px;
  max-width: 280px;
}

.media-count-1 {
  grid-template-columns: 1fr;
  max-width: 200px;
}

.media-count-1 .media-cell {
  aspect-ratio: 4 / 3;
}

.media-count-2 {
  grid-template-columns: repeat(2, 1fr);
}

.media-count-3,
.media-count-5,
.media-count-6,
.media-count-7,
.media-count-8,
.media-count-9 {
  grid-template-columns: repeat(3, 1fr);
}

.media-count-4 {
  grid-template-columns: repeat(2, 1fr);
}

.media-cell {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 2px;
  background: #f2f2f2;
  cursor: pointer;
}

.media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.live-badge {
  position: absolute;
  left: 6px;
  top: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.moment-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: #b2b2b2;
}

.location::before {
  content: '·';
  margin-right: 8px;
}

.preview-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px 24px;
}

.preview-close {
  position: absolute;
  top: 16px;
  right: 20px;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

.preview-body {
  max-width: 100%;
  max-height: 75vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img,
.preview-video {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
}

.preview-caption {
  margin: 16px 0 0;
  max-width: 520px;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .moments-page {
    border-radius: 0;
    max-width: 100%;
  }

  .cover {
    height: 180px;
  }
}
</style>
