# 10 — Question Engine

- Question có nhiều dạng: `multiple-choice`, `code-output`, `fill-blank`, `coding-challenge` (chấm bằng test case).
- Dùng **discriminated union** theo field `type` để TypeScript ép kiểu chặt cho từng dạng câu hỏi — không dùng 1 interface chung nhét hết field optional.
- Chấm điểm `coding-challenge`: chạy trong sandbox riêng (worker), **không** chạy trong process API chính — xem `docs/13-security.md`.
- Difficulty & spaced-repetition: lưu lịch sử `Attempt` để tính lại độ khó cảm nhận / gợi ý ôn tập (thuật toán kiểu SM-2 đơn giản hoá).
