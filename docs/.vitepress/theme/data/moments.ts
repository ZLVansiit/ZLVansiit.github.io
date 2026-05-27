export interface MomentMedia {
  type: 'image' | 'live'
  src: string
  poster?: string
}

export interface MomentPost {
  id: string
  /** 发布时间，格式 yyyy-MM-dd HH:mm:ss，展示时自动转为「刚刚 / n分钟前 / n月n日」等 */
  time: string
  content?: string
  location?: string
  media?: MomentMedia[]
}

export interface MomentsProfile {
  name: string
  avatar: string
  cover?: string
  signature?: string
}

/** 本地静态资源目录（对应 docs/public/moments/） */
const MOMENTS_ASSET = '/moments'

const asset = (filename: string) => `${MOMENTS_ASSET}/${filename}`

/** 本地配图：index 对应 docs/public/moments/img-{index}.jpg */
const localImg = (index: number) => asset(`img-${index}.jpg`)

export const momentsProfile: MomentsProfile = {
  name: '张磊',
  avatar: '/img/logo.svg',
  cover: asset('cover.jpg'),
  signature: '坐睡觉来无一事，满窗晴日看蚕生'
}

/** 朋友圈动态列表（前端静态维护，按时间倒序；time 使用 yyyy-MM-dd HH:mm:ss） */
export function buildMomentsPosts(): MomentPost[] {
  return [
    {
      id: 'mock-long',
      time: '2026-05-04 10:52:00',
      content: '五一。 回老家，见闻。',
      location: '老家',
      media: [1, 2, 3, 4].map((i) => ({ type: 'image' as const, src: localImg(i) }))
    }
  ]
}

/** 朋友圈完整数据（主页资料 + 动态列表） */
export function getMomentsFeedData() {
  const list = buildMomentsPosts()
  return {
    profile: { ...momentsProfile },
    list,
    total: list.length
  }
}

/** @deprecated 请使用 getMomentsFeedData() */
export const buildMomentsMockFeed = getMomentsFeedData

/** @deprecated 请使用 buildMomentsPosts() */
export const buildMomentsMockPosts = buildMomentsPosts

export const momentsPosts = buildMomentsPosts()
