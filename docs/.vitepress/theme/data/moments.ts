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
    },
    {
      id: 'moments-1',
      time: '2026-05-27 13:52:00',
      content: '《儒林外史》的开篇词里，有一句 “人生南北多歧路，将相神仙，也要凡人做”，此句有佛家思想，意味良多。后面几句则是功名富贵、百代兴亡的无聊流俗之语。'
    }
    ,
    {
      id: 'moments-2',
      time: '2026-06-08 13:52:00',
      content: '这轮AI革命，本质是解放人类大脑，解决的是注意力稀缺的问题。前几轮革命，工业革命和互联网革命，都在解放人类体力和劳力。互联网浪潮中的淘汰者们，被我们这一代程序员革命，他们失业找出路然后被遗忘。所以，当风暴又一次来临，只是历史的重演，然后螺旋上升。作为这一轮的“纺织工人”，心情复杂。不管动机和目标如何，敢于革自己的命，本身就是勇气的行为。如果历史有一天，被别人革命了，那就不会发出一丝声音。希望大家都好！'
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
