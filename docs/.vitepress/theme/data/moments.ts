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

const LONG_CONTENT =
  '这是一条用于验证「全文」折叠的长动态。博客朋友圈按微信样式做了封面叠层、九宫格、Live 标记与相对时间。' +
  '配图与实况文件放在 docs/public/moments/，构建后通过 /moments/ 路径访问。' +
  '常家岩、友链、评论可以慢慢接，先把展示效果摸清楚。'

/** 朋友圈动态列表（前端静态维护，按时间倒序；time 使用 yyyy-MM-dd HH:mm:ss） */
export function buildMomentsPosts(): MomentPost[] {
  return [
    {
      id: 'mock-text',
      time: '2026-05-27 10:59:30',
      content: '纯文字动态，无配图。时间应显示为「刚刚」。'
    },
    {
      id: 'mock-long',
      time: '2026-05-27 10:52:00',
      content: LONG_CONTENT,
      location: '武汉'
    },
    {
      id: 'mock-1img',
      time: '2026-05-27 10:35:00',
      content: '单张大图布局（media-count-1）',
      media: [{ type: 'image', src: localImg(1) }]
    },
    {
      id: 'mock-live-1',
      time: '2026-05-27 10:20:00',
      content: '单张 Live，左上角 iOS 风格 LIVE 标记',
      media: [
        {
          type: 'live',
          src: asset('demo-live.mp4'),
          poster: asset('live-poster.jpg')
        }
      ]
    },
    {
      id: 'mock-2img',
      time: '2026-05-27 09:30:00',
      content: '两张图（横排两列）',
      media: [
        { type: 'image', src: localImg(1) },
        { type: 'image', src: localImg(2) }
      ]
    },
    {
      id: 'mock-4img',
      time: '2026-05-27 08:00:00',
      content: '四张图（2×2 四宫格）',
      location: '鄂西北',
      media: [1, 2, 3, 4].map((i) => ({ type: 'image' as const, src: localImg(i) }))
    },
    {
      id: 'mock-3img',
      time: '2026-05-26 18:00:00',
      content: '三张图（三列宫格）',
      media: [1, 2, 3].map((i) => ({ type: 'image' as const, src: localImg(i) }))
    },
    {
      id: 'mock-mix-live',
      time: '2026-05-26 11:00:00',
      content: '静图 + Live 混排（点 Live 格可预览视频）',
      media: [
        { type: 'image', src: localImg(5) },
        {
          type: 'live',
          src: asset('demo-live.mp4'),
          poster: asset('live-poster.jpg')
        },
        { type: 'image', src: localImg(6) }
      ]
    },
    {
      id: 'mock-6img',
      time: '2026-05-25 15:20:00',
      content: '六张图',
      media: [1, 2, 3, 4, 5, 6].map((i) => ({ type: 'image' as const, src: localImg(i) }))
    },
    {
      id: 'mock-9img',
      time: '2026-05-24 09:10:00',
      content: '九宫格上限（9 张）',
      media: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({
        type: 'image' as const,
        src: localImg(i)
      }))
    },
    {
      id: 'mock-5img',
      time: '2026-05-20 12:00:00',
      content: '五张图（多列不规则尾行）',
      media: [1, 2, 3, 4, 5].map((i) => ({ type: 'image' as const, src: localImg(i) }))
    },
    {
      id: 'mock-old',
      time: '2026-05-10 07:30:00',
      content: '较早日期，应显示为「X月X日」而非「X天前」',
      media: [{ type: 'image', src: localImg(3) }]
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
