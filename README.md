<div align="center">

# OnLuyenPV — Frontend Interview Platform

**Master Frontend Engineering Interviews with 2,000+ Curated Questions, Live CQRS Contests, & Real-Time AI Coaching.**

[![Strict TypeScript](https://img.shields.io/badge/TypeScript-Strict%20100%25-3178C6?style=for-the-badge&logo=typescript)](packages/config/tsconfig.base.json)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-000000?style=for-the-badge&logo=next.dot.js)](frontend)
[![NestJS + Fastify](https://img.shields.io/badge/Backend-NestJS%20%2B%20Fastify-E0234E?style=for-the-badge&logo=nestjs)](backend)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Mongoose-47A248?style=for-the-badge&logo=mongodb)](docs/05-database.md)
[![Redis & BullMQ](https://img.shields.io/badge/Queue-Redis%20%2B%20BullMQ-DC382D?style=for-the-badge&logo=redis)](backend/src/shared/redis)
[![Meilisearch](https://img.shields.io/badge/Search-Meilisearch-FF5C35?style=for-the-badge&logo=meilisearch)](backend/src/modules/search)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

[Read Specifications](docs/) • [Contributing Guide](CONTRIBUTING.md) • [Architecture Docs](docs/02-system-architecture.md) • [Agent Rules](AGENTS.md)

</div>

---

## Overview

**OnLuyenPV** is an open-source, production-ready interview preparation platform engineered specifically for **Frontend Engineers**. Unlike generic coding platforms, OnLuyenPV focuses strictly on specialized frontend domain knowledge—from modern React 19 Server Components and Virtual DOM mechanics to Web Workers, Partial Prerendering, CSS Grid Subgrid, and system design patterns.

Built to scale cleanly to **10 million concurrent candidates**, OnLuyenPV uses a **Clean CQRS Architecture**, multi-document MongoDB transactions, sub-millisecond Meilisearch indexing, and the optimal **SuperMemo SM-2 Spaced Repetition Engine** to ensure maximum long-term memory retention.

---

## Key Features

| Feature                       | Description                                                                                                   | Tech Stack                      |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------ | :------------------------------ |
| **2,000+ Curated Questions**  | Covers 4 formats: Multiple Choice, Fill in the Blank, Predict Code Output, and interactive Coding Challenges. | `React Markdown`, `Remark GFM`  |
| **Interactive Monaco Studio** | Full browser-based IDE workspace with live syntax checking and starter code execution.                        | `@monaco-editor/react`          |
| **SM-2 Spaced Repetition**    | Automatically tracks E-Factor and optimal review intervals after every practice attempt.                      | `Domain SM-2 Engine`            |
| **Live Timed Contests**       | High-concurrency coding arenas with multi-document transactions and real-time socket leaderboards.            | `MongoDB Sessions`, `Socket.io` |
| **AI Coach & Quiz Studio**    | Interactive interview coaching, hint generation, and custom quiz creation verified by strict Zod schemas.     | `Central AI Gateway`, `BullMQ`  |
| **Sub-millisecond Search**    | Instant keyword lookups with hybrid fallback from Meilisearch to Mongoose repositories.                       | `Meilisearch Engine`            |

---

## Monorepo Architecture

The repository is structured as a `pnpm` monorepo designed with vertical slice modularity and strict contract isolation:

```
onluyenpv/
├── packages/
│   ├── types/         # Shared strict TypeScript models (User, Question, Contest) & Zod contracts
│   └── config/        # Base strict TypeScript (`tsconfig.base.json`) & ESLint rules
├── backend/           # NestJS + Fastify modular monolith (Vertical Slices: auth, question, contest, ai, search)
├── frontend/          # Next.js 14 App Router with sleek dark mode, glassmorphism, TanStack Query, & Zustand
├── infrastructure/    # Docker Compose (MongoDB replica set, Redis, Meilisearch) & GitHub Actions CI
└── docs/              # 15 comprehensive domain & architectural specification documents
```

---

## Quick Start (Local Development)

### 1. Prerequisites

- **Node.js**: v20+
- **Package Manager**: `pnpm` v9+ (`npm install -g pnpm`)
- **Docker**: For local MongoDB, Redis, and Meilisearch engines.

### 2. Clone & Install

```bash
git clone git@github.com:DoVuDung/onluyenpv.git
cd onluyenpv
pnpm install
```

### 3. Launch Local Infrastructure

Start MongoDB (with replica set for transactions), Redis, and Meilisearch in Docker:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

### 4. Start Development Servers

You can run all services concurrently across the monorepo:

```bash
pnpm run dev
```

Or start specific packages independently:

```bash
# Terminal 1: Backend API & WebSocket Server (http://localhost:3001)
pnpm --filter @onluyenphongvan/backend run dev

# Terminal 2: Next.js Frontend App (http://localhost:3000)
pnpm --filter @onluyenphongvan/frontend run dev
```

---

## Verification & Testing

Every pull request must pass strict TypeScript typechecking across all packages (`noImplicitAny: true`, zero `any`) and unit test suites:

```bash
# Run strict typecheck across all 5 workspace packages
pnpm -r run typecheck

# Run automated unit & application handler tests
pnpm --filter @onluyenphongvan/backend run test

# Run full production build verification
pnpm -r run build
```

---

## How to Contribute (Public Contributions Welcome!)

We welcome contributions from frontend engineers, educators, and architects worldwide! Whether you want to add new real-world interview questions, improve our SM-2 algorithm, or enhance our glassmorphic UI, here is how you can help:

### 1. Add New Interview Questions

Help us reach our goal of 2,000+ top-tier frontend questions! You can easily submit new questions (React, Next.js, TypeScript, CSS, Performance, Web APIs) by following our [Question Contribution Guide](CONTRIBUTING.md#adding-interview-questions).

### 2. Architecture & Code Contributions

Before contributing code, please read:

- [CONTRIBUTING.md](CONTRIBUTING.md) for our workflow, PR rules, and branch naming conventions.
- [AGENTS.md](AGENTS.md) and `.agents/rules/strict-typescript.md` for our non-negotiable strict typing standards.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community etiquette.

### Quick Contribution Steps:

1. **Fork** the repository and clone locally.
2. Create your feature/question branch (`git checkout -b feat/add-react-19-questions`).
3. Make your changes adhering strictly to `AGENTS.md`.
4. Run verification (`pnpm -r run typecheck && pnpm -r run test`).
5. Commit using Conventional Commits (`feat(...)`, `docs(...)`, `test(...)`).
6. Push and open a **Pull Request**!

---

## License

This project is open-source and licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
