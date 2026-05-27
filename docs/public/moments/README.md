# 朋友圈本地素材

文件放在此目录，构建后通过 `/moments/文件名` 访问。

| 文件 | 用途 |
|------|------|
| `cover.jpg` | 顶部封面 |
| `img-1.jpg` … `img-9.jpg` | 动态配图，`moments.ts` 中 `localImg(1)` 对应 `img-1.jpg` |
| `img.jpg` | 可选备用，当前数据未使用 |
| `live-poster.jpg` | Live 封面静帧（与配图独立） |
| `demo-live.mp4` | Live 短视频 |

数据配置：`docs/.vitepress/theme/data/moments.ts`。

- 媒体：`asset('文件名')`
- 发布时间：`time: 'yyyy-MM-dd HH:mm:ss'`（页面自动显示为刚刚 / n分钟前 / n月n日）

## 点赞与评论

复用文章评论接口（`subjectType: moment`，`subjectId` 为动态 `id`）。

- **评论**：正常提交，后台审核通过后显示
- **赞**：以内容为 `【赞】` 的评论写入同一张表，审核通过后显示在点赞区
