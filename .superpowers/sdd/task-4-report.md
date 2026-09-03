# Task 4 Report: 前端 API 客户端与列表页

## Status

**完成** — API 客户端、列表组件、页面与导航/代理均已接入，`docs:build` 通过。

## 实现摘要

| 文件 | 说明 |
|------|------|
| `docs/.vitepress/theme/api/youyongApi.ts` | `YOUYONG_API_BASE`、`YouyongListItem`/`YouyongArticle`、`fetchArticleList`、`fetchArticleDetail` |
| `docs/.vitepress/theme/components/YouyongList.vue` | 纸感浅底 + 轻纹理；主色 `#0085a1`；日期·分类·标题·结论；入场/标题悬停/结论淡入动效；加载更多；跳转 `/youyong/detail?slug=` |
| `docs/youyong.md` | `ClientOnly` + `YouyongList` |
| `docs/.vitepress/theme/index.ts` | 仅注册 `YouyongList`（未注册 `YouyongDetail`） |
| `docs/.vitepress/config.mts` | 导航「有用百科」；`/wiki-api` → `127.0.0.1:8790` 代理 |

## 测试

### 构建

```powershell
npm run docs:build
# ✓ build complete in ~10s
```

### API 冒烟（可选）

```powershell
cd services/youyong-baike
node server.mjs
curl.exe -s "http://127.0.0.1:8790/wiki-api/articles?page=1&pageSize=20"
# total: 2，含 smoke 与生成脚本条目
```

本地 dev 需同时运行 API 与 `npm run docs:dev`，访问 `/youyong` 可见列表。

## Commit

```
feat(youyong): 添加有用百科列表页
```

- 分支：`feat/youyong-baike`
- 未 push（按任务要求）

## 关注点

1. **详情页未实现**：`YouyongDetail` 与 `docs/youyong/detail.md` 留待 Task 5；列表链接已指向 `/youyong/detail?slug=`。
2. **生产 API**：线上依赖 Nginx 反代 `https://vansiit.site/wiki-api`，部署前需确认 Task 6 完成。
3. **字体**：通过组件内 Google Fonts `@import` 加载，首屏可能轻微 FOUT。

## 文件清单

- 新增：`docs/.vitepress/theme/api/youyongApi.ts`
- 新增：`docs/.vitepress/theme/components/YouyongList.vue`
- 新增：`docs/youyong.md`
- 修改：`docs/.vitepress/theme/index.ts`
- 修改：`docs/.vitepress/config.mts`
