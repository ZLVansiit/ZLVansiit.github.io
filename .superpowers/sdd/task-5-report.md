# Task 5 Report: 详情页与首页入口

## Status

**完成** — 详情组件、页面路由、首页入口、DOMPurify 消毒与 VP 标题隐藏均已接入，`docs:build` 通过。

## 实现摘要

| 文件 | 说明 |
|------|------|
| `docs/.vitepress/theme/components/YouyongDetail.vue` | 从 `?slug=` 拉取详情；标题/结论引语/正文（markdown-it `html:false` + DOMPurify）；来源外链；返回列表与上下篇导航 |
| `docs/youyong/detail.md` | `ClientOnly` + `YouyongDetail` |
| `docs/.vitepress/theme/index.ts` | 注册 `YouyongDetail` |
| `docs/index.md` | features 追加「有用百科」入口 |
| `docs/.vitepress/theme/style.css` | `.youyong-detail` 隐藏 VP 默认 h1 |
| `package.json` / `package-lock.json` | 新增 `dompurify`、`@types/dompurify` |

## 测试

### 构建

```powershell
npm run docs:build
# ✓ build complete in ~9.4s
```

### 功能要点

- 无 `slug` 参数：显示「缺少文章标识」
- 有 `slug`：调用 `fetchArticleDetail`，404 显示「文章不存在」
- 正文经 markdown-it 渲染后 DOMPurify 消毒
- 来源链接 `target="_blank"` `rel="noopener noreferrer"`
- 上一篇/下一篇通过 `prev_slug` / `next_slug` 链接

## Commit

```
feat(youyong): 添加有用百科详情页与首页入口
```

- Hash: `d827bd9`
- 分支：`feat/youyong-baike`
- 未 push（按任务要求）

## 关注点

1. **生产 API**：详情页依赖 `https://vansiit.site/wiki-api`，需 Task 6 部署后线上可用。
2. **字体**：组件内 Google Fonts `@import`，与列表页一致，首屏可能轻微 FOUT。
3. **首页图标**：复用 `icons003` 系列（与「精神自旋」相同），后续可换专用图标。

## 文件清单

- 新增：`docs/.vitepress/theme/components/YouyongDetail.vue`
- 新增：`docs/youyong/detail.md`
- 修改：`docs/.vitepress/theme/index.ts`
- 修改：`docs/index.md`
- 修改：`docs/.vitepress/theme/style.css`
- 修改：`package.json`、`package-lock.json`
