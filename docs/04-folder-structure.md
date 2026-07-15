# 04 — Folder Structure

```
frontend-interview-platform/
├── AGENTS.md
├── .agents/
│   └── rules/
│       ├── strict-typescript.md
│       ├── database-mongodb.md
│       ├── api-design.md
│       └── testing.md
├── docs/                       # bộ 15 doc engineering spec (file này)
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── question/
│       │   │   ├── domain/           # entity, value-object, repository interface
│       │   │   ├── application/      # use-case, CQRS command/query
│       │   │   └── infrastructure/   # mongoose schema + repository impl
│       │   ├── auth/
│       │   ├── ai/
│       │   ├── search/
│       │   └── contest/
│       └── shared/                   # filter, pipe, decorator dùng chung
├── frontend/
│   └── src/
│       ├── app/                      # Next.js App Router
│       ├── features/                 # feature-first: question, contest, ai-coach...
│       └── shared/
├── packages/
│   ├── types/                        # type + Zod schema dùng chung FE/BE
│   └── config/                       # eslint, tsconfig base
└── infrastructure/
    ├── docker/
    └── github-actions/
```

## Quy tắc
- 1 feature = 1 folder chứa đủ domain/application/infrastructure của riêng nó (vertical slice).
- Không tạo folder `utils/` chứa hổ lốn nhiều loại logic không liên quan.
- Type/schema dùng chung giữa frontend và backend đặt ở `packages/types`, không định nghĩa lại 2 lần.
