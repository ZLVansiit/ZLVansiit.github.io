<template>
  <div v-if="showPanel" class="moment-interactions">
    <div v-if="likeNames.length" class="moment-likes">
      <svg class="like-heart" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
      <span class="like-names">{{ likeNames.join('、') }}</span>
    </div>

    <ul v-if="displayComments.length" class="moment-comment-list">
      <li v-for="item in displayComments" :key="item.id" class="moment-comment-line">
        <span class="comment-author">{{ item.author }}</span>
        <template v-if="item.replyTo">
          <span class="comment-reply-label">回复</span>
          <span class="comment-author">{{ item.replyTo }}</span>
        </template>
        <span class="comment-colon">：</span>
        <span class="comment-text">{{ item.content }}</span>
      </li>
    </ul>

    <p v-if="statusMessage" class="interaction-status" :class="statusType">{{ statusMessage }}</p>

    <form v-if="showComposer" class="interaction-form" @submit.prevent="submitComment">
      <input v-model="nickname" class="field-input" type="text" placeholder="昵称" required />
      <input v-model="email" class="field-input" type="email" placeholder="邮箱" required />
      <textarea v-model="content" class="field-textarea" rows="2" placeholder="评论…" required />
      <div class="form-actions">
        <button type="button" class="btn-ghost" @click="showComposer = false">取消</button>
        <button type="submit" class="btn-primary" :disabled="submitting">
          {{ submitting ? '发送中…' : '发送' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  MOMENT_LIKE_CONTENT,
  createSubjectComment,
  fetchSubjectComments,
  loadCommenterProfile,
  saveCommenterProfile,
  getOrCreateVoterKey
} from '../api/commentApi'

const SUBJECT_TYPE = 'moment'

const props = defineProps({
  postId: { type: String, required: true },
  postTitle: { type: String, default: '' },
  /** 为 true 时展开评论输入框 */
  composerOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['composer-close', 'updated'])

const voterKey = ref(getOrCreateVoterKey())
const allComments = ref([])
const loading = ref(false)
const submitting = ref(false)
const showComposer = ref(false)
const statusMessage = ref('')
const statusType = ref('info')

const nickname = ref('')
const email = ref('')
const content = ref('')

const isLikeComment = (item) => (item.content || '').trim() === MOMENT_LIKE_CONTENT

const likeComments = computed(() => allComments.value.filter(isLikeComment))

const likeNames = computed(() => likeComments.value.map((item) => item.author))

const displayComments = computed(() => {
  const normal = allComments.value.filter((item) => !isLikeComment(item))
  return normal.map((item) => ({
    id: item.id,
    author: item.author,
    content: item.content,
    replyTo: null
  }))
})

const showPanel = computed(
  () =>
    likeNames.value.length > 0 ||
    displayComments.value.length > 0 ||
    showComposer.value ||
    Boolean(statusMessage.value)
)

const profileEmail = computed(() => email.value.trim().toLowerCase())

const hasLiked = computed(() =>
  likeComments.value.some((item) => item.email && item.email === profileEmail.value && profileEmail.value)
)

const loadComments = async () => {
  loading.value = true
  statusMessage.value = ''
  try {
    const data = await fetchSubjectComments({
      subjectType: SUBJECT_TYPE,
      subjectId: props.postId,
      voterKey: voterKey.value,
      pageSize: 50
    })
    allComments.value = data.list
    emit('updated', { likes: likeNames.value.length, comments: displayComments.value.length })
  } catch (error) {
    statusMessage.value = error?.message || '互动加载失败'
    statusType.value = 'error'
  } finally {
    loading.value = false
  }
}

const ensureProfile = () => {
  const saved = loadCommenterProfile()
  if (!nickname.value) nickname.value = saved.nickname
  if (!email.value) email.value = saved.email
  return Boolean(nickname.value.trim() && email.value.trim())
}

const submitLike = async () => {
  if (!ensureProfile()) {
    showComposer.value = true
    statusMessage.value = '请先填写昵称和邮箱'
    statusType.value = 'info'
    return
  }
  if (hasLiked.value) {
    statusMessage.value = '你已经点过赞了'
    statusType.value = 'info'
    return
  }
  submitting.value = true
  statusMessage.value = ''
  try {
    await createSubjectComment({
      subjectType: SUBJECT_TYPE,
      subjectId: props.postId,
      subjectTitle: props.postTitle || props.postId,
      nickname: nickname.value.trim(),
      email: email.value.trim(),
      content: MOMENT_LIKE_CONTENT
    })
    saveCommenterProfile(nickname.value, email.value)
    statusMessage.value = '已赞，审核通过后显示'
    statusType.value = 'success'
    await loadComments()
  } catch (error) {
    statusMessage.value = error?.message || '点赞失败'
    statusType.value = 'error'
  } finally {
    submitting.value = false
  }
}

const submitComment = async () => {
  if (!ensureProfile() || !content.value.trim()) return
  submitting.value = true
  statusMessage.value = ''
  try {
    await createSubjectComment({
      subjectType: SUBJECT_TYPE,
      subjectId: props.postId,
      subjectTitle: props.postTitle || props.postId,
      nickname: nickname.value.trim(),
      email: email.value.trim(),
      content: content.value.trim()
    })
    saveCommenterProfile(nickname.value, email.value)
    content.value = ''
    showComposer.value = false
    statusMessage.value = '评论已提交，审核通过后显示'
    statusType.value = 'success'
    emit('composer-close')
    await loadComments()
  } catch (error) {
    statusMessage.value = error?.message || '评论失败'
    statusType.value = 'error'
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.composerOpen,
  (open) => {
    if (open) {
      showComposer.value = true
      ensureProfile()
    }
  },
  { immediate: true }
)

onMounted(() => {
  ensureProfile()
  loadComments()
})

defineExpose({ submitLike, loadComments, hasLiked })
</script>

<style scoped>
.moment-interactions {
  margin-top: 8px;
  padding: 8px 10px;
  background: #f7f7f7;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.45;
}

.moment-likes {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid #ececec;
  margin-bottom: 6px;
  color: #576b95;
}

.moment-likes:last-child {
  border-bottom: 0;
  margin-bottom: 0;
  padding-bottom: 0;
}

.like-heart {
  flex-shrink: 0;
  margin-top: 2px;
  color: #fa5151;
}

.like-names {
  color: #576b95;
  word-break: break-all;
}

.moment-comment-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.moment-comment-line + .moment-comment-line {
  margin-top: 4px;
}

.comment-author {
  color: #576b95;
  font-weight: 500;
}

.comment-reply-label {
  color: #888;
  margin: 0 2px;
}

.comment-colon,
.comment-text {
  color: #1a1a1a;
}

.interaction-status {
  margin: 6px 0 0;
  font-size: 12px;
}

.interaction-status.success {
  color: #07c160;
}

.interaction-status.error {
  color: #b91c1c;
}

.interaction-status.info {
  color: #888;
}

.interaction-form {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-input,
.field-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  font-family: inherit;
  background: #fff;
}

.field-textarea {
  resize: vertical;
  min-height: 56px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-ghost,
.btn-primary {
  border: 0;
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
}

.btn-ghost {
  background: #ededed;
  color: #333;
}

.btn-primary {
  background: #07c160;
  color: #fff;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
