# 朋友圈素材目录

将图片、Live 短视频放在此目录，例如：

- `cover.jpg` — 顶部封面
- `demo-live.mp4` — Live 实况视频
- `*.jpg` / `*.png` — 动态配图

## 数据发布

朋友圈内容已改为从 **hd-service** 接口拉取，请在后台 **朋友圈** 模块发布动态并配置主页资料。

执行数据库脚本：`hd-service/src/main/resources/db/migration/V20260527__blog_moments.sql`
