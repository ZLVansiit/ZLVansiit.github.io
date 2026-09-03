# 有用百科 — 设计规格

日期：2026-09-03  
状态：待实现

## 1. 目标

在个人博客（VitePress / vansiit.cc）新增板块「有用百科」：由服务器定时调用 DeepSeek 生成跨学科中文知识短文，经独立极简 API 供列表页与详情页展示。

成功标准：

- 导航可进入美观的列表页与详情页
- 服务器每日自动生成 1 条；部署完成后首次批量生成 10 条
- API Key 不进入 Git；前端只读公开接口

## 2. 范围

**包含**

- 独立 Node 服务（Express）+ SQLite
- 生成脚本 `generate.mjs` + cron
- VitePress 列表页 `/youyong`、详情页 `/youyong/detail?slug=`
- 导航与首页入口
- Nginx 反代 `https://vansiit.site/wiki-api` → 本机 `:8790`

**不包含**

- 扩展现有 `vansiit.site/hd/api` 业务后端
- 列表分类筛选
- 外接搜索引擎做联网核验（v1 靠 prompt 约束来源与截至日期）
- 写操作 HTTP API、管理后台、用户投稿

## 3. 架构

```
generate.mjs ──► DeepSeek API
      │
      ▼
 SQLite + Express (:8790)
      ▲
 Nginx /wiki-api/*
      │
 vansiit.cc /youyong、/youyong/detail?slug=
```

- 部署目录建议：`/opt/youyong-baike/`
- 进程：pm2 常驻 API（与极简运维一致）
- 密钥：服务器 `.env` 中的 `DEEPSEEK_API_KEY`

## 4. 数据模型

表 `articles`：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| slug | TEXT UNIQUE | URL 标识 |
| title | TEXT | 标题 |
| summary | TEXT | 一句话核心结论 |
| category | TEXT | 学科分类（轮换与展示标签） |
| body_md | TEXT | 正文 Markdown |
| sources | TEXT | JSON：`[{title, url}]` |
| created_at | TEXT | ISO 时间 |

分类枚举（轮换）：自然科学、技术与工程、经济与商业、历史与文明、地理与社会、哲学与心理、艺术与文化。

## 5. API

公开只读：

- `GET /wiki-api/articles?page=1&pageSize=20`  
  响应：`{ total, list: [{ id, slug, title, summary, category, created_at }] }`
- `GET /wiki-api/articles/:slug`  
  响应：完整条目（含 `body_md`、`sources`、`prev_slug`、`next_slug`）

CORS：允许 `https://vansiit.cc`（及本地开发源）。

无公开写接口；写入仅由 `generate.mjs` 直连 SQLite。

## 6. 前端

- `docs/youyong.md`：列表（ClientOnly 组件 `YouyongList`）
- `docs/youyong/detail.md`：详情（ClientOnly 组件 `YouyongDetail`，从 `?slug=` 读取并拉 API，Markdown 安全渲染）
- 导航增加「有用百科」；首页 features 增加入口
- 列表：时间倒序；日期 · 分类 · 标题 · 结论；无筛选；底部「加载更多」
- 详情：大标题、结论引语、正文阅读区、来源区、返回列表；提供上一篇/下一篇（API 附带 `prev_slug` / `next_slug`）
- 视觉：主色沿用 `#0085a1`；纸感浅底 + 轻纹理；展示字体标题 + 清晰正文；列表入场、标题强调、结论条淡入等 2–3 处动效；不以卡片堆砌为主

## 7. 生成与定时

提示词：使用产品需求中的完整中文提示词（选题轮换、背景、结构、去重、来源要求等）。

`generate.mjs` 流程：

1. 读取近 30 天 title/summary/category，注入 prompt 防重复
2. 按轮换规则选定下一 `category`
3. 调用 DeepSeek（`deepseek-chat`），要求结构化 JSON：`title, summary, category, body_md, sources`
4. 校验必填字段与大致字数后写入 DB；失败只记日志
5. 支持 `--count=N`；首次 `--count=10`，日常 `--count=1`

Cron 示例：

```cron
0 8 * * * cd /opt/youyong-baike && /usr/bin/node generate.mjs --count=1 >> logs/cron.log 2>&1
```

## 8. 错误处理与运维

- DeepSeek 超时/非 JSON/缺字段：重试有限次数后放弃该次任务并打日志
- API 404：slug 不存在返回标准 JSON 错误
- 磁盘/DB 损坏：启动时确保目录与表结构存在（migrate on boot）
- 日志：`logs/cron.log`、`logs/api.log`

## 9. 安全

- API Key 仅服务器环境变量，禁止提交仓库
- 公开 API 只读；生成脚本不对外暴露
- 渲染 Markdown 时做 XSS 防护（消毒或安全渲染库）

## 10. 验收

1. 打开 `/youyong` 可见列表，样式与动效正常（桌面/移动）
2. 点击条目进入详情，正文与来源可读
3. 服务器存在 cron；手动 `node generate.mjs --count=10` 成功写入 10 条且列表可见
4. 仓库中无 DeepSeek Key / 服务器密码
