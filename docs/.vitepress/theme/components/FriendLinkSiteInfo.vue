<template>
  <section class="friend-link-site-info">
    <div class="site-info-header">
      <h3 class="site-info-title">本站信息</h3>
      <button type="button" class="copy-btn" :disabled="copying" @click="copySiteInfo">
        {{ copied ? '已复制' : '复制本站信息' }}
      </button>
    </div>
    <p class="site-info-desc">申请友链时可将下方信息粘贴到您的站点，便于对方添加本站链接。</p>
    <pre class="site-info-block" aria-label="本站友链信息">{{ siteInfoText }}</pre>
    <p v-if="copyError" class="status-error">{{ copyError }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const siteInfoText = `申请友链
title： Z.L Vansiit's blog
website： https://vansiit.cc/
description： 技术博客 | 生活随笔 | 唠嗑扯淡
image：https://vansiit.cc/img/logo.svg`

const copying = ref(false)
const copied = ref(false)
const copyError = ref('')

const copySiteInfo = async () => {
  copyError.value = ''
  copying.value = true
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(siteInfoText)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = siteInfoText
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
    copyError.value = '复制失败，请手动选中下方文本复制'
  } finally {
    copying.value = false
  }
}
</script>

<style scoped>
.friend-link-site-info {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.site-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 0.35rem;
}

.site-info-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.site-info-desc {
  margin: 0 0 0.75rem;
  color: #666;
  font-size: 0.92rem;
}

.site-info-block {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  color: #374151;
  font-size: 0.88rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, 'Cascadia Code', 'Segoe UI Mono', monospace;
}

.copy-btn {
  flex-shrink: 0;
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 6px;
  background: #1677ff;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
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

.dark .friend-link-site-info {
  border-top-color: #334155;
}

.dark .site-info-desc {
  color: #94a3b8;
}

.dark .site-info-block {
  background: #0f172a;
  border-color: #334155;
  color: #e5e7eb;
}

.dark .status-error {
  color: #fca5a5;
}
</style>
