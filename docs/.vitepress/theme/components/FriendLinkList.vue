<template>
  <div class="friend-link-list">
    <p v-if="loading" class="status-loading">友链加载中...</p>
    <p v-else-if="errorMessage" class="status-error">{{ errorMessage }}</p>
    <article v-for="item in links" :key="item.id" class="link-item">
      <a class="link-title" :href="item.siteUrl" target="_blank" rel="noopener noreferrer">
        <img
          v-if="item.siteIcon"
          class="link-icon"
          :src="item.siteIcon"
          alt=""
          width="20"
          height="20"
        />
        <span v-else class="link-icon-fallback">{{ getFallbackIcon(item.siteName) }}</span>
        <span class="link-name">{{ item.siteName }}</span>
      </a>
      <p v-if="item.description">{{ item.description }}</p>
    </article>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const FRIEND_LINK_LIST_API = import.meta.env.DEV
  ? 'http://127.0.0.1:8080/hd/api/third/friend-links'
  : 'https://vansiit.site/hd/api/third/friend-links'
const THIRD_PARTY_KEY = 'blog_vansiit_cc'
const THIRD_PARTY_SECRET = 'c37bd3571d9d4d779cfc6b64c1ea7b16'

const links = ref([])
const loading = ref(false)
const errorMessage = ref('')

const buildHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Third-Party-Key': THIRD_PARTY_KEY,
  'X-Third-Party-Secret': THIRD_PARTY_SECRET
})

const getFallbackIcon = (name) => (name?.trim()?.[0] || '链').toUpperCase()

const fetchLinks = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await fetch(FRIEND_LINK_LIST_API, {
      method: 'GET',
      headers: buildHeaders()
    })
    if (!res.ok) {
      throw new Error(`友链加载失败(${res.status})`)
    }
    const data = await res.json()
    links.value = data?.list || []
  } catch (error) {
    errorMessage.value = error?.message || '友链加载失败'
    links.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLinks()
})
</script>

<style scoped>
.friend-link-list {
  margin: 0;
}
.link-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  transition: background 0.2s;
}
.link-item:hover {
  background: #f9f9f9;
}
.link-item .link-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  font-weight: bold;
  color: #2980b9;
  text-decoration: none;
}
.link-item .link-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 4px;
}
.link-item .link-icon-fallback {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: #d1d5db;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
}
.link-item .link-name {
  line-height: 1.2;
  white-space: nowrap;
}
.link-item p {
  margin: 5px 0 0;
  color: #666;
  font-size: 0.9em;
}
.status-loading,
.status-error {
  margin: 0 0 8px;
  font-size: 0.92rem;
}
.status-loading {
  color: #6b7280;
}
.status-error {
  color: #b91c1c;
}

.dark .link-item {
  border-color: #334155;
}
.dark .link-item:hover {
  background: #1e293b;
}
.dark .link-item p {
  color: #94a3b8;
}
.dark .status-loading {
  color: #94a3b8;
}
.dark .status-error {
  color: #fca5a5;
}
</style>
