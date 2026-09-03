# 有用百科 API 部署说明

## 生产环境（当前）

生产使用 **Docker** 运行 Node 18，**未使用 pm2**（CentOS 7 + Node 16 无法编译 `better-sqlite3` 原生模块）。

### 目录

| 路径 | 说明 |
|------|------|
| `/opt/youyong-baike/` | 源码、`data/youyong.db`、`logs/` |
| `/opt/youyong-baike/.env` | 环境变量（仅服务器，勿提交 git） |

### 启动 API

```bash
docker run -d --name youyong-baike --restart unless-stopped --network host \
  -v /opt/youyong-baike:/app -w /app --env-file /opt/youyong-baike/.env \
  node:18-bookworm node server.mjs
```

- 镜像：`node:18-bookworm`（含完整编译工具链，用于 `npm install`）
- 依赖安装：`docker run --rm -v /opt/youyong-baike:/app -w /app node:18-bookworm npm install --omit=dev`
- 监听 `127.0.0.1:8790`（`--network host` 与 Nginx 反代配合）

### Nginx

将仓库内 `nginx-wiki-api.conf` 合并进站点配置（如 `/etc/nginx/conf.d/vansiit.site.conf`）：

```nginx
location /wiki-api/ {
    proxy_pass http://127.0.0.1:8790;
    ...
}
```

公网入口：`https://vansiit.site/wiki-api/`

### 定时生成

```cron
0 8 * * * docker exec youyong-baike node generate.mjs --count=1 >> /opt/youyong-baike/logs/cron.log 2>&1
```

依赖容器名 `youyong-baike` 持续运行（`--restart unless-stopped`）。

### 手动生成

```bash
docker exec youyong-baike node generate.mjs --count=1
```

## 备用方案：pm2

仓库中的 `ecosystem.config.cjs` 为 **备用/文档**，当前生产未启用。若宿主机 Node ≥18 且能编译 `better-sqlite3`，可用：

```bash
pm2 start ecosystem.config.cjs
```

## 本地开发

```bash
cd services/youyong-baike
cp .env.example .env   # 填入 DEEPSEEK_API_KEY
npm install
npm start              # 127.0.0.1:8790
npm test
```
