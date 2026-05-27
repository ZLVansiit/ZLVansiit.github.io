# 朋友圈本地素材

文件放在此目录，构建后通过 `/moments/文件名` 访问。

| 文件 | 用途 |
|------|------|
| `cover.jpg` | 顶部封面 |
| `img-1.jpg` … `img-9.jpg` | 动态配图，`moments.ts` 中 `localImg(1)` 对应 `img-1.jpg` |
| `img.jpg` | 可选备用，当前数据未使用 |
| `live-poster.jpg` | Live 封面静帧 |
| `demo-live.mp4` | Live 短视频 |

数据配置：`docs/.vitepress/theme/data/moments.ts`。

- 媒体：`asset('文件名')`
- 发布时间：`time: 'yyyy-MM-dd HH:mm:ss'`（页面自动显示为刚刚 / n分钟前 / n月n日）
