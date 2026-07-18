---
name: onluyenphongvan-code-review
description: Comprehensive code review guardrail and checklist tailored for the onluyenphongvan (Frontend Interview Platform) codebase. Enforces Clean Architecture, CQRS, MongoDB strict schemas, and strict TypeScript rules.
---

# `onluyenphongvan` Code Review Guardrail

When reviewing code or inspecting existing modules in this repository, execute the following systematic checks:

## 1. Strict TypeScript Check
- **No `as unknown` Casts**: Search for `as unknown` or unnecessary type assertions.
  - *Common Trap*: `(doc as unknown as { createdAt: Date }).createdAt` in Mongoose mappers.
  - *Fix*: Ensure Mongoose document classes (`*DocumentClass`) explicitly declare `readonly createdAt!: Date;` and `readonly updatedAt!: Date;` when using `@Schema({ timestamps: true })`.
- **No `any` or `@ts-ignore`**: Flag any use of `any`, `Schema.Types.Mixed`, or `@ts-ignore`/`@ts-expect-error`.
- **Discriminated Unions**: Verify that entities with multiple variations (`Question`, `CreateQuestionInput`) use discriminated unions on `type` instead of loose optional fields.

## 2. Database & MongoDB Check (`database-mongodb.md`)
- **No `[Object]` / `Mixed` in `@Prop()`**: Never allow `@Prop({ type: [Object] })` or `@Prop({ type: Object })` in Mongoose schemas.
  - *Fix*: Define explicit sub-schemas (`@Schema() export class QuestionOptionSchema`) or strict schema primitives.
- **Clean Architecture Boundary**: Verify that `domain/` layer files (`*.interface.ts`, entities, value objects) have zero Mongoose/database imports or decorators (`@Prop`, `@Schema`, `Document`). Mongoose must reside strictly inside `infrastructure/`.
- **Multi-Document Transactions**: Verify that multi-step write operations spanning multiple collections use MongoDB sessions/transactions (`session.withTransaction()`).

## 3. API & CQRS Check (`api-design.md`)
- **Controllers Route via CQRS**: Controllers must never inject repositories (`IQuestionRepository`) or services directly for core domain logic; they must dispatch `Command` (`commandBus.execute`) or `Query` (`queryBus.execute`) objects.
  - *Exception*: Simple read-only metadata lookups (`MetadataController`) may inject repository interfaces if documented.
- **Envelope Response & Pagination**: Ensure responses follow the `{ data, meta, error }` envelope format (enforced globally via `ResponseEnvelopeInterceptor`) and use strict cursor-based pagination (`cursor`, `hasNextPage`) without `skip/limit`.

## 4. Testing & Verification Check (`testing.md`)
- Ensure every new or modified use-case (`*.command.ts`, `*.query.ts`) has corresponding unit tests with mock repositories.
- Verify SM-2 spaced repetition grading logic includes boundary condition tests.
