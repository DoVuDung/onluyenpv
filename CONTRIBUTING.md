# Contributing to OnLuyenPV ⚡

First off, thank you for considering contributing to **OnLuyenPV**! Our mission is to build the world's highest-quality, open-source interview preparation platform specifically tailored for **Frontend Engineers**.

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md) and strict engineering standards (`AGENTS.md`).

---

## 🧭 How You Can Help

1. **Adding & Curating Interview Questions**: We are growing our question bank to 2,000+ real-world frontend questions across React, Next.js, System Design, CSS, Performance, and Web APIs.
2. **Feature Development**: Enhancing the Next.js UI, NestJS/Fastify CQRS handlers, AI coaching worker prompts, or SM-2 retention algorithms.
3. **Bug Fixes & Performance**: Optimizing MongoDB indexing, Redis caching layers, or Meilisearch query speeds.
4. **Documentation**: Writing clear guides, explanations, and architectural diagrams.

---

## 📝 Adding Interview Questions (No Code Required!)

If you want to submit a new question to the practice bank:

1. You can open an issue using our [Question Submission Issue Template](.github/ISSUE_TEMPLATE/question_submission.yml).
2. Or submit a PR directly by adding a seed file or updating the database fixtures under `backend/src/modules/question/infrastructure/fixtures/`.

### Question Guidelines:
- **Formats Allowed**:
  - `multiple-choice`: 4 options minimum, exactly 1 marked `correct: true`.
  - `fill-blank`: Target exact keywords (e.g. `useActionState, useTransition`).
  - `code-output`: Provide a clean, formatted `codeSnippet` and the exact string output.
  - `coding-challenge`: Provide clean `starterCode` suitable for `@monaco-editor/react`.
- **Explanations**: Every question MUST include a detailed, educational Markdown `explanation` describing *why* the correct answer works and *why* distractors are incorrect.

---

## 💻 Code Contributions & Development Workflow

### 1. Prerequisite Checks
Before starting any development, read the non-negotiable rules in our repository root:
- **`AGENTS.md`**: Main project rules and architectural boundaries.
- **`.agents/rules/strict-typescript.md`**: Strict TypeScript guidelines (zero `any`, no `@ts-ignore`, exact types required).
- **`.agents/rules/database-mongodb.md`**: MongoDB Mongoose schema design rules.

### 2. Local Setup
```bash
# Fork & clone your repository
git clone git@github.com:<your-username>/onluyenpv.git
cd onluyenpv

# Install workspace dependencies via pnpm
pnpm install

# Start local Docker infrastructure (MongoDB, Redis, Meilisearch)
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

### 3. Branch Naming
Create a branch from `master` with a descriptive prefix:
- `feat/question-bookmarks`
- `fix/sm2-interval-calculation`
- `docs/update-architecture-diagrams`
- `test/auth-guard-suite`

### 4. Commit Standards (Conventional Commits)
We enforce [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <short summary>
```
Examples:
- `feat(question): add cursor pagination for difficulty filtering`
- `fix(auth): handle buffer length discrepancy in timingSafeEqual`
- `docs(readme): add public contribution guide and shields`
- `test(backend): add unit test for SM-2 spaced repetition progress`

### 5. Verification Checklist Before Submitting PR
Your Pull Request **must** pass all checks locally before pushing:
```bash
# 1. Monorepo strict typecheck (must produce zero errors across all packages)
pnpm -r run typecheck

# 2. Automated unit & application tests
pnpm --filter @onluyenphongvan/backend run test

# 3. Production build check
pnpm -r run build
```

---

## 🔄 Pull Request Review Process

1. Fill out our automated [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely.
2. Ensure CI build checks pass on GitHub Actions.
3. A core maintainer will review your code for Clean Architecture adherence, strict typing (`noImplicitAny`), and test coverage.
4. Once approved, your PR will be squash-merged into `master`!

Welcome to the **OnLuyenPV** engineering team! 🚀
