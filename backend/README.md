# ISS-R5 收集 API

此目录提供可实际部署的 Cloudflare Worker + D1 实现，以及不依赖第三方包的 Python 3 本机参考 API。GitHub Pages 只能托管静态前端，不保存集中数据；`collection.js` 在 `formsEndpoint` 为空或不是完整 `http(s)` URL 时禁用在线提交，只保存草稿并导出 JSON/CSV。

## Cloudflare Worker + D1

1. 在 Cloudflare 创建 D1 数据库，并把 `wrangler.toml` 中的 `database_id` 替换为真实 ID。
2. 从仓库根目录执行 `wrangler d1 execute iss-r5-submissions --remote --file=backend/schema.sql`（或按 Cloudflare 当前 CLI 语法执行）。
3. 在 Worker 环境中设置 `ALLOWED_ORIGINS` 为逗号分隔的完整来源白名单，例如 `https://example.github.io/iss-r5-package`。不要填 `*`；不要在前端放 token。
4. 用 `wrangler secret put ADMIN_TOKEN` 设置管理员导出令牌。令牌只存在 Worker secret，不能写入 Git、HTML 或 `window.ISS_CONFIG`。
5. 部署 Worker。部署后把父代理配置的 `window.ISS_CONFIG.formsEndpoint` 设置为完整 POST URL，例如 `https://api.example.workers.dev/api/submissions`。不要在本任务中发布或写入账户配置。

Worker 接受 `POST /api/submissions`，请求为 `{kind,recordId,workshop:'ISS-R5',fields,consent:true}`。首次持久化返回 `201 {ok:true,id,createdAt}`；相同 `recordId` 返回相同回执（幂等）。未知 kind、缺少必填项、超长字段、超过 50KB、非 true consent 都会拒绝。`GET /api/submissions`、`GET /api/submissions.json` 和 `GET /api/submissions.csv` 均要求 `Authorization: Bearer ADMIN_TOKEN`；CSV/JSON 导出不会通过公网 HTML 自动展示。

CORS 只接受 `ALLOWED_ORIGINS` 的精确 Origin；无 Origin 的本机调用可用，但没有 Origin 的请求不能绕过管理员 Bearer 鉴权。实现使用参数化 D1 SQL、常量时间 token 比较，并对 CSV 公式前缀做转义。公网投入业务前仍需网关节流/反垃圾、日志与告警、企业身份认证或至少额外的访问控制；ADMIN_TOKEN 不是完整登录系统。

## Python 3 本机端到端参考

数据库默认写入临时用户数据目录 `${TMPDIR:-/tmp}/iss-r5-collection/submissions.sqlite3`，也可用 `ISS_DB_PATH=/path/to/private.sqlite3` 指定；不会写入 Git。启动：

```bash
cd /home/ubuntu/iss_r5_package
ADMIN_TOKEN='replace-with-local-token' \
ALLOWED_ORIGINS='http://127.0.0.1:8000,http://localhost:8000' \
ISS_PORT=8787 python3 backend/server.py
```

管理员导出示例（仅在受控机器执行）：

```bash
curl -H 'Authorization: Bearer replace-with-local-token' \
  'http://127.0.0.1:8787/api/submissions?format=json'
curl -H 'Authorization: Bearer replace-with-local-token' \
  'http://127.0.0.1:8787/api/submissions.csv' > submissions.csv
```

Python 与 Worker 的校验、幂等、CORS、管理员鉴权、CSV 注入防护和响应语义保持一致。`test_server.py` 使用临时 SQLite 和临时端口，仅验证本地行为；运行后应停止测试进程。
