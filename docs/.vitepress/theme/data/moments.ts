export interface MomentMedia {
  /** image 静态图；live 实况（短视频，可配 poster） */
  type: 'image' | 'live'
  /** 图片地址，或 live 的视频地址 */
  src: string
  /** live 封面图（可选，默认同 src 为图片时仅展示封面） */
  poster?: string
}

export interface MomentPost {
  id: string
  /** 展示时间，如 2026-05-26 18:30 */
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

export const momentsProfile: MomentsProfile = {
  name: '张磊',
  avatar: '/img/logo.svg',
  cover: '/moments/cover.jpg'
}

/** 按时间倒序，最新在前 */
export const momentsPosts: MomentPost[] = [
  {
    id: 'm-20260526-1',
    time: '2026-05-26 18:20',
    content: '常家岩的名字，再过一代也许就没人说得清了。写下来，算给自己留个底。',
    location: '鄂西北'
  },
  {
    id: 'm-20260520-1',
    time: '2026-05-20 09:15',
    content: '五一回去，山上风还是老样子。给了老张一支烟，两个人都没多说话。',
    media: [
      { type: 'image', src: '/img/logo.svg' },
      { type: 'image', src: '/img/logo.svg' },
      { type: 'live', src: '/moments/demo-live.mp4', poster: '/img/logo.svg' }
    ]
  },
  {
    id: 'm-20260512-1',
    time: '2026-05-12 22:40',
    content:
      '博客友链页接好了，Meet Blog 星图留着，其余的走审核列表。朋友圈也按微信样式搭了一版：封面、昵称在右下角、九宫格、Live 标记、全文折叠和时间「几分钟前」。后面慢慢把随笔都搬过来，当自己的一小块自留地。'
  },
  {
    id: 'm-20260408-1',
    time: '2026-04-08 07:30',
    content: '早上喝咖啡，看窗外发呆五分钟，比刷手机舒服。',
    media: [{ type: 'image', src: '/img/logo.svg' }]
  }
]
