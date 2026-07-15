# 03 — Tech Stack

## Frontend
- Next.js 16, React 19, TypeScript (strict)
- Tailwind v4, Shadcn/ui
- TanStack Query (server state), Zustand (client state)

## Backend
- NestJS + Fastify adapter
- **MongoDB** 8.x (thay cho Postgres trong bản đề xuất tham khảo ban đầu)
- Mongoose (typed schema) + Zod cho validate ở boundary (DTO, input ngoài)
- Redis (cache + BullMQ queue)
- BullMQ (background job: chấm điểm AI, gửi email, reindex search)

## Search
- Meilisearch (hoặc Typesense) — không search full-text trực tiếp trên MongoDB.

## Infra
- Docker, Traefik (reverse proxy)
- Cloudflare (CDN/DNS) + Cloudflare R2 (object storage)
- Better Auth (authentication)
- WebSocket (realtime: live contest, leaderboard)
- OpenTelemetry + Grafana + Loki (observability)
- PostHog (product analytics)
- GitHub Actions (CI/CD)

## Không dùng trong dự án này
Postgres, Prisma, hoặc bất kỳ SQL ORM nào — các phần này chỉ xuất hiện trong tài liệu tham khảo gốc, đã được thay bằng MongoDB/Mongoose.
