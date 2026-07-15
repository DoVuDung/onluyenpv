# 08 — Performance

- **Không** dùng offset pagination — luôn cursor pagination (dựa trên `_id` hoặc field có index kèm `_id` làm tie-breaker).
- **Không** `find({})` lấy hết field — luôn dùng projection cho đúng field application layer cần.
- **Không** N+1 query: dùng `$lookup` (aggregation) hoặc batch-load (DataLoader) thay vì loop query trong loop.
- Redis cache cho: Question detail, Leaderboard, Profile công khai, Category list.
  - TTL 5 phút: dữ liệu hay đổi (leaderboard live).
  - TTL 30 phút: dữ liệu vừa (question list theo filter).
  - TTL 24h: dữ liệu gần như tĩnh (category, tag list).
- Cache nhiều tầng: SWR (client) → ISR (Next.js page) → Edge cache (Cloudflare) → Redis (server) → in-memory LRU (hot path rất nhỏ).
- Ảnh: AVIF/WebP, lazy load, dùng `next/image`.
- Bundle: code-split theo route, dynamic import cho phần nặng (code editor, AI chat), tree-shaking.
- MongoDB: connection pool hợp lý theo số instance backend, `readPreference: secondaryPreferred` cho query đọc không cần realtime tuyệt đối, ưu tiên covering index khi có thể.
