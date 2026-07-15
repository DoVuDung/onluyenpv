# 07 — Authentication & Authorization

- Better Auth cho auth flow (email/password, OAuth Google/GitHub).
- JWT access token ngắn hạn (15 phút) + refresh token (httpOnly cookie).
- Role-based: `guest`, `user`, `premium`, `moderator`, `admin`.
- Permission check nằm ở Application layer (use-case) — **không** check quyền trong Controller hay trực tiếp trong Mongoose query.
- Không bao giờ trả password hash / token bí mật trong response DTO — dùng mapper riêng để serialize `User` ra ngoài.
