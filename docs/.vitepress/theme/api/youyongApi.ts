export const YOUYONG_API_BASE = import.meta.env.DEV
  ? '/wiki-api'
  : 'https://vansiit.site/wiki-api'

/** 与生成脚本轮换分类保持一致 */
export const YOUYONG_CATEGORIES = [
  '自然科学',
  '技术与工程',
  '经济与商业',
  '历史与文明',
  '地理与社会',
  '哲学与心理',
  '艺术与文化'
] as const

export interface YouyongListItem {
  id: number
  slug: string
  title: string
  summary: string
  category: string
  created_at: string
}

export interface YouyongArticle extends YouyongListItem {
  body_md: string
  sources: { title: string; url: string }[]
  prev_slug: string | null
  next_slug: string | null
}

export async function fetchArticleList(
  page = 1,
  pageSize = 12,
  category = ''
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize)
  })
  if (category) params.set('category', category)
  const res = await fetch(`${YOUYONG_API_BASE}/articles?${params}`)
  if (!res.ok) throw new Error(`list ${res.status}`)
  return res.json() as Promise<{ total: number; list: YouyongListItem[] }>
}

export async function fetchArticleDetail(slug: string) {
  const res = await fetch(`${YOUYONG_API_BASE}/articles/${encodeURIComponent(slug)}`)
  if (!res.ok) throw new Error(`detail ${res.status}`)
  return res.json() as Promise<YouyongArticle>
}
