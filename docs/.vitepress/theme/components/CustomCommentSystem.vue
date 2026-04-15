<template>
  <section class="custom-comment-section">
    <h3 class="comment-title">评论</h3>

    <form class="comment-form" @submit.prevent="handleSubmit">
      <div class="form-row">
        <input v-model="form.nickname" class="field-input" type="text" placeholder="昵称" />
        <input v-model="form.email" class="field-input" type="email" placeholder="邮箱" />
        <input v-model="form.website" class="field-input" type="url" placeholder="网址" />
      </div>
      <textarea v-model="form.content" class="field-textarea" rows="4" placeholder="键入内容..." />
      <div v-if="activeMainTagTab" class="tag-panel">
        <div class="tag-panel-title">{{ getTagLabel(activeMainTagTab) }}</div>
        <div class="tag-list">
          <button
            v-for="tag in getTagItems(activeMainTagTab)"
            :key="tag"
            type="button"
            class="tag-item-btn"
            @click="insertTag('main', tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
      <div class="form-footer">
        <div class="form-tools">
          <button type="button" class="tool-btn" :class="{ active: activeMainTagTab === 'kaomoji' }" @click="toggleTagTab('main', 'kaomoji')">☺</button>
          <button type="button" class="tool-btn" :class="{ active: activeMainTagTab === 'emoji' }" @click="toggleTagTab('main', 'emoji')">Ⓜ</button>
        </div>
        <button type="submit" class="submit-btn">发送</button>
      </div>
    </form>

    <div class="comment-summary">
      <span class="comment-count">{{ totalCount }} 条评论</span>
      <span class="summary-arrow">▼</span>
    </div>

    <div class="comment-list">
      <article v-for="item in pagedComments" :key="item.id" class="comment-item">
        <div class="avatar">{{ item.author.charAt(0) }}</div>
        <div class="comment-body">
          <header class="comment-meta">
            <span class="author">{{ item.author }}</span>
            <span v-if="item.badge" class="badge">{{ item.badge }}</span>
            <span class="date">{{ item.date }}</span>
          </header>
          <p class="comment-content">{{ item.content }}</p>
          <div class="comment-actions">
            <button type="button">赞同 ({{ item.likes }})</button>
            <button type="button" @click="openReplyComposer(item.id, null, item.author)">回复</button>
          </div>

          <div v-if="item.replies?.length" class="reply-list">
            <article v-for="reply in item.replies" :key="reply.id" class="reply-item">
              <div class="avatar small">{{ reply.author.charAt(0) }}</div>
              <div class="comment-body">
                <header class="comment-meta">
                  <span class="author">{{ reply.author }}</span>
                  <span v-if="reply.badge" class="badge">{{ reply.badge }}</span>
                  <span class="date">{{ reply.date }}</span>
                </header>
                <p class="comment-content">{{ reply.content }}</p>
                <div class="comment-actions">
                  <button type="button">赞同 ({{ reply.likes }})</button>
                  <button type="button" @click="openReplyComposer(item.id, reply.id, reply.author)">回复</button>
                </div>
              </div>
            </article>
          </div>

          <form
            v-if="isReplyingTo(item.id)"
            class="comment-form inline-reply-form"
            @submit.prevent="handleReplySubmit"
          >
            <div class="form-row">
              <input v-model="replyForm.nickname" class="field-input" type="text" placeholder="昵称" />
              <input v-model="replyForm.email" class="field-input" type="email" placeholder="邮箱" />
              <input v-model="replyForm.website" class="field-input" type="url" placeholder="网址" />
            </div>
            <textarea v-model="replyForm.content" class="field-textarea" rows="3" placeholder="键入内容..." />
            <div v-if="activeReplyTagTab" class="tag-panel">
              <div class="tag-panel-title">{{ getTagLabel(activeReplyTagTab) }}</div>
              <div class="tag-list">
                <button
                  v-for="tag in getTagItems(activeReplyTagTab)"
                  :key="`reply-${tag}`"
                  type="button"
                  class="tag-item-btn"
                  @click="insertTag('reply', tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
            <div class="form-footer">
              <div class="form-tools">
                <span class="reply-tag">
                  回复 @{{ replyTarget?.author }}
                  <button type="button" class="reply-tag-close" @click="clearReplyComposer">×</button>
                </span>
                <button type="button" class="tool-btn" :class="{ active: activeReplyTagTab === 'kaomoji' }" @click="toggleTagTab('reply', 'kaomoji')">☺</button>
                <button type="button" class="tool-btn" :class="{ active: activeReplyTagTab === 'emoji' }" @click="toggleTagTab('reply', 'emoji')">Ⓜ</button>
              </div>
              <button type="submit" class="submit-btn">发送</button>
            </div>
          </form>
        </div>
      </article>
    </div>

    <footer class="pager">
      <button type="button" class="pager-btn" :disabled="currentPage === 1" @click="currentPage -= 1">上一页</button>
      <span class="pager-info">{{ currentPage }} / {{ totalPages }}</span>
      <button type="button" class="pager-btn" :disabled="currentPage === totalPages" @click="currentPage += 1">下一页</button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const form = ref({ nickname: '', email: '', website: '', content: '' })
const replyForm = ref({ nickname: '', email: '', website: '', content: '' })
const replyTarget = ref(null)
const activeMainTagTab = ref('')
const activeReplyTagTab = ref('')

const tagTabs = [
  { key: 'kaomoji', label: '颜表情' },
  { key: 'emoji', label: 'Emoji' }
]

const tagItemsMap = {
  kaomoji: ['(๑•̀ㅂ•́)و', '(ಡωಡ)', '(ง •̀_•́)ง', '(￣▽￣)~*', '(╯°□°）╯', '(｡•̀ᴗ-)✧', '(´▽`ʃ♡ƪ)', '(๑>؂<๑)', '(づ￣ 3￣)づ', '(｀･ω･´)'],
  emoji: ['😀', '😄', '😆', '🤣', '😊', '😉', '😍', '😘', '🤔', '😎', '🥳', '👏', '👍', '👎', '❤️', '🎉', '🔥', '🚀']
}

const totalCount = 46
const pageSize = 10
const currentPage = ref(1)
const comments = ref([
  { id: 'c1', author: 'Y', date: '2025-07-15', content: 'Hi', likes: 0, replies: [] },
  {
    id: 'c2',
    author: '幽々子',
    date: '2025-06-11',
    content: '博主您好，我也配置了 Artalk 作为评论系统，并且我的博客跟您一样使用 Fuwari 主题，但是我的 Artalk 无法像您的这样，根据 Fuwari 主题的暗色模式自动切换暗色。',
    likes: 2,
    replies: [
      { id: 'r21', author: 'Frost Ming', badge: 'Admin', date: '2025-06-13', content: 'auto 的意思是跟随系统，而不是跟随主题切换。需要在代码中自己把切换主题的动作连接到评论系统。', likes: 3 }
    ]
  },
  { id: 'c3', author: '七月', date: '2025-05-20', content: '这个评论区样式很舒服，期待后端接入后支持实时刷新。', likes: 1, replies: [] },
  { id: 'c4', author: '匿名', date: '2025-05-10', content: '已经很像截图效果了。', likes: 0, replies: [] }
])

const totalPages = computed(() => Math.max(1, Math.ceil(totalCount / pageSize)))
const pagedComments = computed(() => comments.value)

const handleSubmit = () => {
  if (!form.value.content.trim()) return
  form.value.content = ''
}

const openReplyComposer = (commentId, replyId, author) => {
  replyTarget.value = { commentId, replyId, author }
  if (!replyForm.value.nickname) replyForm.value.nickname = form.value.nickname
  if (!replyForm.value.email) replyForm.value.email = form.value.email
  if (!replyForm.value.website) replyForm.value.website = form.value.website
}

const clearReplyComposer = () => {
  replyTarget.value = null
  replyForm.value.content = ''
  activeReplyTagTab.value = ''
}

const isReplyingTo = (commentId) => replyTarget.value?.commentId === commentId

const handleReplySubmit = () => {
  if (!replyTarget.value || !replyForm.value.content.trim()) return
  const targetComment = comments.value.find((item) => item.id === replyTarget.value.commentId)
  if (!targetComment) return

  const replyAuthor = replyForm.value.nickname.trim() || '访客'
  const today = new Date().toISOString().slice(0, 10)
  const content = replyTarget.value.replyId
    ? `回复 @${replyTarget.value.author}：${replyForm.value.content.trim()}`
    : replyForm.value.content.trim()

  targetComment.replies.push({
    id: `r-${Date.now()}`,
    author: replyAuthor,
    date: today,
    content,
    likes: 0
  })

  clearReplyComposer()
}

const toggleTagTab = (target, tabKey) => {
  if (target === 'main') {
    activeMainTagTab.value = activeMainTagTab.value === tabKey ? '' : tabKey
    return
  }
  activeReplyTagTab.value = activeReplyTagTab.value === tabKey ? '' : tabKey
}

const getTagItems = (tabKey) => tagItemsMap[tabKey] || []
const getTagLabel = (tabKey) => tagTabs.find((tab) => tab.key === tabKey)?.label || ''

const insertTag = (target, tag) => {
  if (target === 'reply') {
    replyForm.value.content = `${replyForm.value.content}${tag} `
    return
  }
  form.value.content = `${form.value.content}${tag} `
}
</script>

<style scoped>
.custom-comment-section { margin: 2rem 0; color: #111827; }
.comment-title { margin: 0 0 0.85rem; font-size: 1.9rem; font-weight: 700; }
.comment-form { border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; }
.form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; border-bottom: 1px solid #f3f4f6; }
.field-input { width: 100%; border: 0; border-right: 1px solid #f3f4f6; min-height: 52px; padding: 0 16px; font-size: 0.98rem; outline: none; }
.field-input:last-child { border-right: 0; }
.field-textarea { width: 100%; border: 0; min-height: 126px; resize: vertical; padding: 14px 16px; font-size: 0.98rem; outline: none; }
.tag-panel { border-top: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6; padding: 8px 10px 10px; }
.tag-panel-title { color: #6b7280; font-size: 0.85rem; margin-bottom: 8px; }
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
.tag-item-btn { border: 0; background: #f9fafb; color: #374151; border-radius: 6px; padding: 3px 8px; font-size: 0.9rem; cursor: pointer; }
.tag-item-btn:hover { background: #eef2ff; color: #1d4ed8; }
.form-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f3f4f6; padding: 10px 12px; }
.form-tools { display: flex; align-items: center; gap: 8px; }
.tool-btn { border: 0; background: transparent; color: #6b7280; font-size: 1rem; cursor: pointer; }
.tool-btn.active { color: #1677ff; font-weight: 700; }
.submit-btn { min-width: 106px; height: 36px; border: 0; border-radius: 6px; background: #1677ff; color: #fff; font-size: 1rem; cursor: pointer; }
.comment-summary { margin: 1rem 0 0.75rem; display: flex; align-items: center; gap: 8px; }
.comment-count { font-weight: 700; line-height: 1.2; }
.summary-arrow { color: #6b7280; font-size: 0.85rem; margin-top: 8px; }
.comment-list { display: flex; flex-direction: column; gap: 1rem; }
.comment-item, .reply-item { display: flex; align-items: flex-start; gap: 12px; }
.avatar { width: 52px; height: 52px; border-radius: 50%; background: #d1d5db; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; flex-shrink: 0; }
.avatar.small { width: 40px; height: 40px; font-size: 1rem; }
.comment-body { min-width: 0; flex: 1; }
.comment-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
.author { font-size: 1.1rem; font-weight: 600; color: #1677ff; }
.badge { border-radius: 6px; background: #1677ff; color: #fff; padding: 1px 8px; font-size: 0.72rem; }
.date { color: #6b7280; font-size: 1rem; }
.comment-content { margin: 0 0 6px; font-size: 1.05rem; line-height: 1.75; color: #111827; }
.comment-actions { display: flex; align-items: center; gap: 14px; }
.comment-actions button { border: 0; background: transparent; color: #4b5563; padding: 0; font-size: 0.96rem; cursor: pointer; }
.reply-list { margin-top: 0.75rem; border-left: 2px solid #e5e7eb; padding-left: 12px; display: flex; flex-direction: column; gap: 0.75rem; }
.inline-reply-form { margin-top: 0.85rem; }
.reply-tag { display: inline-flex; align-items: center; gap: 6px; border-radius: 6px; background: #f3f4f6; color: #374151; font-size: 0.88rem; padding: 4px 8px; }
.reply-tag-close { border: 0; background: transparent; color: #6b7280; cursor: pointer; line-height: 1; padding: 0; }
.pager { margin-top: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 12px; }
.pager-btn { border: 1px solid #d1d5db; background: #fff; color: #374151; border-radius: 6px; padding: 4px 10px; cursor: pointer; }
.pager-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.pager-info { font-size: 0.9rem; color: #6b7280; }

@media (max-width: 960px) {
  .form-row { grid-template-columns: 1fr; }
  .field-input { border-right: 0; border-bottom: 1px solid #f3f4f6; }
  .field-input:last-child { border-bottom: 0; }
  .comment-count { font-size: 1.35rem; }
  .author { font-size: 1rem; }
  .date { font-size: 0.92rem; }
  .comment-content { font-size: 1rem; }
  .comment-actions button { font-size: 0.92rem; }
}

.dark .custom-comment-section { color: #e5e7eb; }
.dark .comment-form { background: #0f172a; border-color: #334155; }
.dark .form-row, .dark .form-footer, .dark .field-input { border-color: #334155; background: #0f172a; color: #e5e7eb; }
.dark .field-textarea { background: #0f172a; color: #e5e7eb; }
.dark .tag-panel { border-color: #334155; }
.dark .tag-panel-title { color: #94a3b8; }
.dark .tag-item-btn { background: #1f2937; color: #cbd5e1; }
.dark .tag-item-btn:hover { background: #243244; color: #93c5fd; }
.dark .tool-btn.active { color: #60a5fa; }
.dark .comment-content { color: #e2e8f0; }
.dark .comment-actions button, .dark .summary-arrow, .dark .pager-info { color: #94a3b8; }
.dark .reply-list { border-left-color: #334155; }
.dark .reply-tag { background: #1f2937; color: #cbd5e1; }
.dark .pager-btn { background: #0f172a; border-color: #334155; color: #e2e8f0; }
</style>
