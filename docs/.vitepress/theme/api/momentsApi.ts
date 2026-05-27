export interface MomentMedia {
  type: 'image' | 'live'
  src: string
  poster?: string
}

export interface MomentPost {
  id: number | string
  time: string
  content?: string
  location?: string
  media?: MomentMedia[]
}

export interface MomentsProfile {
  name: string
  avatar: string
  cover?: string
  /** 个性签名，显示在头像下方 */
  signature?: string
}

export interface MomentsFeedData {
  profile: MomentsProfile
  list: MomentPost[]
  total: number
}

import { buildMomentsMockFeed } from '../data/moments'

/** 开发环境默认 Mock；设 VITE_MOMENTS_USE_API=true 时走真实接口 */
export const isMomentsMockMode =
  import.meta.env.DEV && import.meta.env.VITE_MOMENTS_USE_API !== 'true'

const MOMENTS_FEED_API = import.meta.env.DEV
  ? '/hd/api/third/moments/feed'
  : 'https://vansiit.site/hd/api/third/moments/feed'

const THIRD_PARTY_KEY = 'blog_vansiit_cc'
const THIRD_PARTY_SECRET = 'c37bd3571d9d4d779cfc6b64c1ea7b16'

const buildHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Third-Party-Key': THIRD_PARTY_KEY,
  'X-Third-Party-Secret': THIRD_PARTY_SECRET
})

export async function fetchMomentsFeed(): Promise<MomentsFeedData> {
  if (isMomentsMockMode) {
    await new Promise((r) => setTimeout(r, 280))
    return buildMomentsMockFeed()
  }

  const res = await fetch(MOMENTS_FEED_API, {
    method: 'GET',
    headers: buildHeaders()
  })
  if (!res.ok) {
    throw new Error(`朋友圈加载失败(${res.status})`)
  }
  const data = await res.json()
  return {
    profile: data?.profile || { name: '张磊', avatar: '/img/logo.svg' },
    list: data?.list || [],
    total: Number(data?.total || 0)
  }
}
