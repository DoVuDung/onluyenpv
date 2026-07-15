# 14 — Deployment

```
Cloudflare → Traefik → Next.js (frontend container) → NestJS (backend container) → Redis → MongoDB
```

## Docker services
`frontend`, `backend`, `worker` (BullMQ), `redis`, `mongodb` (replica set — bắt buộc để dùng transaction), `meilisearch`.

## CI/CD
GitHub Actions: lint → typecheck (strict) → test → build → deploy.
**Không merge** nếu bất kỳ bước nào fail, kể cả bước typecheck.
