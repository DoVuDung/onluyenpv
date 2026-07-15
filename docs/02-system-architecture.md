# 02 — System Architecture

## Luồng cấp cao
```
Next.js (SSR/ISR, RSC)
  → API Gateway (Traefik)
  → NestJS (Fastify adapter)
  → Application layer (use-case, CQRS)
  → Domain layer (entity, value object — không phụ thuộc DB)
  → Infrastructure layer (Mongoose repository, Redis, Meilisearch, S3/R2)
  → MongoDB
```

## Kiểu kiến trúc
**Modular Monolith** trước — KHÔNG tách microservice ngay từ đầu, ưu tiên tốc độ phát triển ở v1/v2.

Ranh giới module (để tách microservice sau nếu cần scale):
- Question Module
- AI Module
- Auth Module
- Search Module
- Contest Module

Mỗi module tự chứa domain + application + infrastructure riêng (vertical slice), giao tiếp qua interface/event — **không import chéo internals** giữa các module.

## Nguyên tắc layer
- Domain layer: TypeScript thuần, chỉ có entity/value-object/Repository interface. Không import Mongoose, không import Nest decorators.
- Infrastructure layer: implement Repository interface bằng Mongoose, map Document → domain type qua mapper riêng.
- CQRS áp dụng cho phần đọc nặng tách khỏi ghi: Leaderboard, Analytics, Search.
