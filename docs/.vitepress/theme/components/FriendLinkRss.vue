<template>
  <section class="friend-link-rss">
    <div class="rss-header">
      <h3 class="rss-title">RSS 订阅</h3>
      <div class="rss-actions">
        <a class="rss-open-btn" :href="rssUrl" target="_blank" rel="noopener noreferrer">
          打开 RSS
        </a>
        <button type="button" class="copy-btn" :disabled="copying" @click="copyRssUrl">
          {{ copied ? '已复制' : '复制订阅地址' }}
        </button>
      </div>
    </div>
    <p class="rss-desc">使用阅读器订阅本站更新，可将下方地址添加到 Feedly、Inoreader 等 RSS 客户端。</p>
    <pre class="rss-url-block" aria-label="RSS 订阅地址">{{ rssUrl }}</pre>
    <p v-if="copyError" class="status-error">{{ copyError }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const rssUrl = 'https://vansiit.cc/rss.xml'

const copying = ref(false)
const copied = ref(false)
const copyError = ref('')

const copyRssUrl = async () => {
  copyError.value = ''
  copying.value = true
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(rssUrl)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = rssUrl
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (!ok) throw new Error('copy failed')
    }
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    copyError.value = '复制失败，请手动选中下方地址复制'
  } finally {
    copying.value = false
  }
}
</script>

<style scoped>
.friend-link-rss {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.rss-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 0.35rem;
}

.rss-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.rss-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.rss-desc {
  margin: 0 0 0.75rem;
  color: #666;
  font-size: 0.92rem;
}

.rss-url-block {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  color: #374151;
  font-size: 0.88rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: ui-monospace, 'Cascadia Code', 'Segoe UI Mono', monospace;
}

.rss-open-btn,
.copy-btn {
  flex-shrink: 0;
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.rss-open-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.rss-open-btn:hover {
  background: #e5e7eb;
}

.copy-btn {
  background: #1677ff;
  color: #fff;
}

.copy-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.copy-btn:not(:disabled):active {
  opacity: 0.85;
}

.status-error {
  margin: 0.5rem 0 0;
  font-size: 0.92rem;
  color: #b91c1c;
}

.dark .friend-link-rss {
  border-top-color: #334155;
}

.dark .rss-desc {
  color: #94a3b8;
}

.dark .rss-url-block {
  background: #0f172a;
  border-color: #334155;
  color: #e5e7eb;
}

.dark .rss-open-btn {
  background: #1e293b;
  border-color: #334155;
  color: #e5e7eb;
}

.dark .rss-open-btn:hover {
  background: #334155;
}

.dark .status-error {
  color: #fca5a5;
}
</style>
