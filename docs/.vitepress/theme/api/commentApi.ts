/** 第三方评论接口（与 CustomCommentSystem 共用） */
export const COMMENT_API_BASE = import.meta.env.DEV
  ? '/hd/api/third/comments'
  : 'https://vansiit.site/hd/api/third/comments'

const THIRD_PARTY_KEY = 'blog_vansiit_cc'
const THIRD_PARTY_SECRET = 'c37bd3571d9d4d779cfc6b64c1ea7b16'

export const COMMENT_STATUS_APPROVED = 'approved'
export const COMMENT_STATUS_PENDING = 'pending'

/** 朋友圈「赞」在评论表中的约定内容（审核通过后显示在点赞区） */
export const MOMENT_LIKE_CONTENT = '【赞】'

export interface CommentUser {
  nickname?: string
  email?: string
}

export interface RawComment {
  id: number | string
  content?: string
  createdAt?: string
  likeCount?: number
  liked?: boolean
  replyCount?: number
  user?: CommentUser
  replies?: RawComment[]
}

export interface MappedComment {
  id: number | string
  author: string
  email: string
  date: string
  content: string
  likes: number
  liked: boolean
  replyCount: number
  replies: MappedComment[]
}

export const buildCommentHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Third-Party-Key': THIRD_PARTY_KEY,
  'X-Third-Party-Secret': THIRD_PARTY_SECRET
})

export function getOrCreateVoterKey(): string {
  if (typeof window === 'undefined') return 'server_voter'
  const key = 'custom-comment-voter-key'
  const cached = window.localStorage.getItem(key)
  if (cached) return cached
  const next = `browser_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  window.localStorage.setItem(key, next)
  return next
}

export const COMMENTER_PROFILE_KEY = 'custom-comment-profile'

export function loadCommenterProfile(): { nickname: string; email: string } {
  if (typeof window === 'undefined') return { nickname: '', email: '' }
  try {
    const raw = window.localStorage.getItem(COMMENTER_PROFILE_KEY)
    if (!raw) return { nickname: '', email: '' }
    const parsed = JSON.parse(raw)
    return {
      nickname: String(parsed?.nickname || '').trim(),
      email: String(parsed?.email || '').trim()
    }
  } catch {
    return { nickname: '', email: '' }
  }
}

export function saveCommenterProfile(nickname: string, email: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      COMMENTER_PROFILE_KEY,
      JSON.stringify({ nickname: nickname.trim(), email: email.trim() })
    )
  } catch {
    // 忽略本地存储失败
  }
}

export function mapComment(raw: RawComment): MappedComment {
  return {
    id: raw.id,
    author: raw.user?.nickname || '匿名',
    email: String(raw.user?.email || '').trim().toLowerCase(),
    date: raw.createdAt || '',
    content: raw.content || '',
    likes: Number(raw.likeCount || 0),
    liked: Boolean(raw.liked),
    replyCount: Number(raw.replyCount || 0),
    replies: (raw.replies || []).map(mapComment)
  }
}

export async function fetchSubjectComments(options: {
  subjectType: string
  subjectId: string
  voterKey: string
  page?: number
  pageSize?: number
}): Promise<{ list: MappedComment[]; total: number; hasMore: boolean; page: number }> {
  const params = new URLSearchParams({
    subjectType: options.subjectType,
    subjectId: options.subjectId,
    status: COMMENT_STATUS_APPROVED,
    reviewStatus: COMMENT_STATUS_APPROVED,
    voterKey: options.voterKey,
    page: String(options.page ?? 1),
    pageSize: String(options.pageSize ?? 50)
  })
  const res = await fetch(`${COMMENT_API_BASE}?${params.toString()}`, {
    method: 'GET',
    headers: buildCommentHeaders()
  })
  if (!res.ok) throw new Error(`评论加载失败(${res.status})`)
  const data = await res.json()
  return {
    list: (data.list || []).map(mapComment),
    total: Number(data.total || 0),
    hasMore: Boolean(data.hasMore),
    page: Number(data.page || options.page || 1)
  }
}

export async function createSubjectComment(payload: {
  subjectType: string
  subjectId: string
  subjectTitle: string
  nickname: string
  email: string
  content: string
  parentId?: number | string | null
  replyToCommentId?: number | string | null
}) {
  const res = await fetch(COMMENT_API_BASE, {
    method: 'POST',
    headers: buildCommentHeaders(),
    body: JSON.stringify({
      subjectType: payload.subjectType,
      subjectId: payload.subjectId,
      subjectTitle: payload.subjectTitle,
      status: COMMENT_STATUS_PENDING,
      reviewStatus: COMMENT_STATUS_PENDING,
      nickname: payload.nickname,
      email: payload.email,
      content: payload.content,
      parentId: payload.parentId ?? null,
      replyToCommentId: payload.replyToCommentId ?? null
    })
  })
  if (!res.ok) throw new Error(`提交失败(${res.status})`)
  return res.json()
}

export async function toggleCommentLike(options: {
  commentId: number | string
  subjectType: string
  subjectId: string
  voterKey: string
  liked: boolean
}) {
  const method = options.liked ? 'DELETE' : 'POST'
  const params = new URLSearchParams({
    subjectType: options.subjectType,
    subjectId: options.subjectId
  })
  if (method === 'DELETE') params.set('voterKey', options.voterKey)
  const endpoint = `${COMMENT_API_BASE}/${options.commentId}/like?${params.toString()}`
  const res = await fetch(endpoint, {
    method,
    headers: buildCommentHeaders(),
    body: method === 'POST' ? JSON.stringify({ voterKey: options.voterKey }) : undefined
  })
  if (!res.ok) throw new Error(`操作失败(${res.status})`)
}
