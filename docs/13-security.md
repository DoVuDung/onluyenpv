# 13 — Security

- Sandbox chạy code người dùng submit (coding-challenge) trong container cô lập, giới hạn CPU/memory/thời gian, **không** có network access.
- Input validate bằng Zod ở mọi boundary (API request, job queue payload).
- Không hardcode secret — dùng env + secret manager, không commit `.env`.
- Rate limit + captcha cho endpoint auth (chống brute-force).
- Escape/sanitize markdown do người dùng tạo (discussion, comment) trước khi render — chống XSS.
- CORS whitelist domain cụ thể, không dùng `*` ở production.
