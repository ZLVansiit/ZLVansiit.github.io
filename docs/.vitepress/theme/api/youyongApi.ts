export const YOUYONG_API_BASE = import.meta.env.DEV
  ? '/wiki-api'
  : 'https://vansiit.site/wiki-api'

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

export async function fetchArticleList(page = 1, pageSize = 20) {
  const res = await fetch(`${YOUYONG_API_BASE}/articles?page=${page}&pageSize=${pageSize}`)
  if (!res.ok) throw new Error(`list ${res.status}`)
  return res.json() as Promise<{ total: number; list: YouyongListItem[] }>
}

export async function fetchArticleDetail(slug: string) {
  const res = await fetch(`${YOUYONG_API_BASE}/articles/${encodeURIComponent(slug)}`)
  if (!res.ok) throw new Error(`detail ${res.status}`)
  return res.json() as Promise<YouyongArticle>
}
