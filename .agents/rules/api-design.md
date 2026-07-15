# API Design & CQRS Rule

## Core Principles
1. **REST Path Versioning**: All API endpoints MUST be prefixed with `/api/v1/...`.
2. **Unified Response Envelope**: Every HTTP response MUST conform to the standard envelope format:
   ```json
   {
     "data": { ... } | [ ... ] | null,
     "meta": {
       "cursor": "...",
       "hasNextPage": true,
       "total": 100
     } | null,
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "Invalid input",
       "details": [ ... ]
     } | null
   }
   ```
3. **Strict Cursor Pagination**: Never use offset-based (`skip/limit`) pagination for public or high-traffic endpoints. Always use cursor-based pagination using `_id` or indexed timestamp/score fields.
4. **Zod Validation at Boundaries**: All Request DTOs and Query Parameters MUST be validated via global Zod validation pipes before reaching use-case handlers.
5. **No Stack Traces in Production**: Error filters must sanitize errors and return standardized error codes (`code`, `message`, `details`) without leaking internal Mongoose stack traces.
6. **CQRS Separation**: Separate heavy read queries (Leaderboard, Search, Analytics, Question Feed) from write commands (`CreateQuestion`, `SubmitAttempt`).
