# 朋友圈本地素材

文件放在此目录，构建后通过 `/moments/文件名` 访问。

| 文件 | 用途 |
|------|------|
| `cover.jpg` | 顶部封面 |
| `img.jpg`、`img-1.jpg` … | 动态配图（可只保留一张，在 `moments.ts` 里改路径） |
| `live-poster.jpg` | Live 封面静帧 |
| `demo-live.mp4` | Live 短视频 |

数据配置：`docs/.vitepress/theme/data/moments.ts` 中的 `asset('文件名')`。
