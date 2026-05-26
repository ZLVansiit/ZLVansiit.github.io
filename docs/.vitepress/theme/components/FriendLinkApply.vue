<template>
  <section class="friend-link-apply">
    <h3 class="apply-title">申请友链</h3>
    <p class="apply-desc">填写站点信息提交申请，审核通过后会展示在友链列表。</p>

    <form class="apply-form" @submit.prevent="handleSubmit">
      <div class="form-row">
        <input v-model="form.siteName" class="field-input" type="text" placeholder="网站名称 *" />
        <input v-model="form.contactEmail" class="field-input" type="email" placeholder="联系邮箱 *" />
      </div>
      <input v-model="form.siteUrl" class="field-input full" type="url" placeholder="网站地址 *（https://）" />
      <input v-model="form.siteIcon" class="field-input full" type="url" placeholder="网站图标地址（可选）" />
      <textarea
        v-model="form.description"
        class="field-textarea"
        rows="3"
        placeholder="网站简介（可选）"
      />

      <div class="form-footer">
        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交申请' }}
        </button>
      </div>
    </form>

    <p v-if="errorMessage" class="status-error">{{ errorMessage }}</p>
    <p v-else-if="successMessage" class="status-success">{{ successMessage }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const FRIEND_LINK_API = import.meta.env.DEV
  ? 'http://127.0.0.1:8080/hd/api/third/friend-links/applications'
  : 'https://vansiit.site/hd/api/third/friend-links/applications'
const THIRD_PARTY_KEY = 'blog_vansiit_cc'
const THIRD_PARTY_SECRET = 'c37bd3571d9d4d779cfc6b64c1ea7b16'

const form = ref({
  siteName: '',
  siteUrl: '',
  siteIcon: '',
  description: '',
  contactEmail: ''
})
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const buildHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Third-Party-Key': THIRD_PARTY_KEY,
  'X-Third-Party-Secret': THIRD_PARTY_SECRET
})

const handleSubmit = async () => {
  if (
    !form.value.siteName.trim() ||
    !form.value.siteUrl.trim() ||
    !form.value.contactEmail.trim()
  ) {
    errorMessage.value = '请填写网站名称、网站地址和联系邮箱'
    successMessage.value = ''
    return
  }

  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res = await fetch(FRIEND_LINK_API, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        siteName: form.value.siteName.trim(),
        siteUrl: form.value.siteUrl.trim(),
        siteIcon: form.value.siteIcon.trim(),
        description: form.value.description.trim(),
        contactEmail: form.value.contactEmail.trim()
      })
    })
    if (!res.ok) {
      throw new Error(`提交失败(${res.status})`)
    }
    const data = await res.json()
    successMessage.value = data?.message || '友链申请已提交，审核通过后将展示在友链列表。'
    form.value.siteName = ''
    form.value.siteUrl = ''
    form.value.siteIcon = ''
    form.value.description = ''
    form.value.contactEmail = ''
  } catch (error) {
    errorMessage.value = error?.message || '提交失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.friend-link-apply {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}
.apply-title {
  margin: 0 0 0.35rem;
  font-size: 1.25rem;
  font-weight: 700;
}
.apply-desc {
  margin: 0 0 0.85rem;
  color: #666;
  font-size: 0.92rem;
}
.apply-form {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid #f3f4f6;
}
.field-input {
  width: 100%;
  border: 0;
  border-right: 1px solid #f3f4f6;
  min-height: 48px;
  padding: 0 14px;
  font-size: 0.95rem;
  outline: none;
  box-sizing: border-box;
}
.field-input.full {
  border-right: 0;
  border-bottom: 1px solid #f3f4f6;
}
.field-input:last-child {
  border-right: 0;
}
.field-textarea {
  width: 100%;
  border: 0;
  min-height: 96px;
  resize: vertical;
  padding: 12px 14px;
  font-size: 0.95rem;
  outline: none;
  box-sizing: border-box;
}
.form-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 12px;
  border-top: 1px solid #f3f4f6;
}
.submit-btn {
  min-width: 108px;
  height: 36px;
  border: 0;
  border-radius: 6px;
  background: #1677ff;
  color: #fff;
  font-size: 0.95rem;
  cursor: pointer;
}
.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.status-error,
.status-success {
  margin: 0.75rem 0 0;
  font-size: 0.92rem;
}
.status-error {
  color: #b91c1c;
}
.status-success {
  color: #047857;
}

@media (max-width: 960px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  .field-input {
    border-right: 0;
    border-bottom: 1px solid #f3f4f6;
  }
}

.dark .friend-link-apply {
  border-top-color: #334155;
}
.dark .apply-desc {
  color: #94a3b8;
}
.dark .apply-form {
  background: #0f172a;
  border-color: #334155;
}
.dark .form-row,
.dark .field-input,
.dark .field-textarea,
.dark .form-footer {
  border-color: #334155;
  background: #0f172a;
  color: #e5e7eb;
}
.dark .status-error {
  color: #fca5a5;
}
.dark .status-success {
  color: #6ee7b7;
}
</style>
