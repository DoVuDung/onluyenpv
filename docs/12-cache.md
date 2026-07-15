# 12 — Cache (Redis)

## Namespace key
- `question:{id}`
- `category:{id}`
- `company:{id}`
- `leaderboard:{contestId}`
- `user:{id}:public`

## TTL
- 5 phút: dữ liệu hay đổi (leaderboard live).
- 30 phút: dữ liệu vừa (question list theo filter).
- 24h: dữ liệu gần như tĩnh (category, tag list).

## Invalidation
Invalidate theo event (vd: update Question → xoá cache `question:{id}` + các cache liên quan) — **không** chỉ dựa vào TTL cho dữ liệu quan trọng.
