# 06 — API Design

- REST, versioned qua path: `/api/v1/...`.
- Input luôn validate bằng Zod DTO trước khi vào use-case — không tin `req.body` trực tiếp.
- Response envelope thống nhất:
```json
{ "data": {}, "meta": { "cursor": "..." }, "error": null }
```
- Lỗi trả về theo format chuẩn (`code`, `message`, `details`) — không leak stack trace hay chi tiết DB ra client ở production.
- Pagination: **luôn cursor-based**, không offset (`skip/limit` chỉ dùng cho tool admin nội bộ với dữ liệu nhỏ).
- Mỗi endpoint public quan trọng cần rate-limit (Redis token bucket).
- OpenAPI spec generate tự động từ Nest decorators — không viết tay file swagger riêng để tránh lệch với code thật.
