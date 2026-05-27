# 朋友圈素材目录

将图片、Live 短视频放在此目录，例如：

- `cover.jpg` — 顶部封面
- `demo-live.mp4` — Live 实况视频
- `*.jpg` / `*.png` — 动态配图

## 本地 Mock 预览

开发环境（`npm run docs:dev`）默认使用 **Mock 数据**（12 条，覆盖单图/多图/Live/长文等）。

若要联调真实接口，启动前设置环境变量：

```bash
# Windows PowerShell
$env:VITE_MOMENTS_USE_API="true"; npm run docs:dev
```

## 数据发布

生产环境从 **hd-service** 接口拉取；请在后台 **朋友圈** 模块发布动态并配置主页资料。

执行数据库脚本：`hd-service/src/main/resources/db/migration/V20260527__blog_moments.sql`
