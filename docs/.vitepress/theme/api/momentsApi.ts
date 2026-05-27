/** 朋友圈类型定义（数据见 theme/data/moments.ts） */
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
  signature?: string
}

export interface MomentsFeedData {
  profile: MomentsProfile
  list: MomentPost[]
  total: number
}
