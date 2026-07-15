# 09 — Search

## Flow
```
React (debounce input) → API /search → Meilisearch → id list → lấy chi tiết từ MongoDB
```

- **Không** query MongoDB trực tiếp cho full-text search — luôn đi qua Meilisearch.
- Đồng bộ index: mỗi khi Question/Company/Tag thay đổi → publish event → BullMQ job reindex Meilisearch (eventual consistency; không đồng bộ đồng thời trong request chính để tránh chậm write).
