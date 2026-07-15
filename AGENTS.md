# Frontend Interview Platform — AGENTS.md

> File này agent (Antigravity, Claude Code, Cursor, Gemini CLI...) đọc **đầu tiên** trước khi làm bất kỳ task nào trong repo. Antigravity đọc file này tự động ở project root trước khi spawn agent.

## Mục tiêu
Xây dựng nền tảng luyện phỏng vấn Frontend Engineer tốt nhất: 2.000+ câu hỏi, AI Coach, public, chịu tải cao (mục tiêu scale tới 10 triệu users).

## Yêu cầu bắt buộc
- Production-ready — không sinh demo code, không để lại TODO bỏ lửng, không code "tạm rồi sửa sau".
- Clean Architecture, DDD theo vertical slice / feature-first.
- Event-driven khi hợp lý (BullMQ cho async job).
- AI-first: mọi feature nên cân nhắc điểm chèn AI (gợi ý, giải thích, coach).
- SEO-friendly: SSR/ISR cho trang public (question detail, company page...).
- Mobile-first UI.
- High performance: cursor pagination, không N+1, cache tầng Redis.

## Nguyên tắc code bắt buộc
- SOLID, Clean Code, Repository Pattern, CQRS khi cần tách read/write nặng (vd leaderboard).
- Không duplicate logic — dùng chung qua `packages/`.
- Composition over inheritance.
- Mọi PR phải có test đi kèm (xem `.agents/rules/testing.md`).
- **TypeScript strict tuyệt đối** — xem `.agents/rules/strict-typescript.md`. Đây là rule ưu tiên cao nhất khi generate code.
- **Database: MongoDB** (không phải SQL) — xem `.agents/rules/database-mongodb.md`.

## Đọc theo thứ tự khi bắt đầu 1 task
1. `docs/01-product.md` — hiểu domain/business trước khi đụng code.
2. `docs/02-system-architecture.md` — biết task thuộc layer nào.
3. `docs/04-folder-structure.md` — biết đặt file ở đâu.
4. `docs/05-database.md` — schema MongoDB liên quan tới task.
5. Doc cụ thể theo feature (06 → 15 trong `docs/`).
6. Toàn bộ `.agents/rules/*.md` — rule bắt buộc áp dụng cho mọi code generate ra.

## Không được làm
- Không tự ý đổi database hoặc thêm ORM/thư viện mới ngoài `docs/03-tech-stack.md` nếu chưa hỏi lại.
- Không viết `any`, không tắt strict mode, không dùng `@ts-ignore`/`@ts-expect-error` để né lỗi type.
- Không lưu dữ liệu không có schema rõ ràng (`Mixed`/`any`) vào MongoDB nếu có thể định nghĩa field cụ thể.
- Dự án dùng **MongoDB**, không dùng Postgres/SQL — bỏ qua mọi gợi ý dùng Prisma/SQL từ tài liệu tham khảo cũ.
- Không tạo file kiến trúc/API mới mà không cập nhật doc tương ứng trong `docs/`.
