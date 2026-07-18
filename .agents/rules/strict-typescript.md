# Strict TypeScript Rule

## Core Principles
1. **No `any` allowed**: Every variable, parameter, return type, and property MUST have an explicit, strongly-typed definition. Do not use `any`. Use `unknown` with narrowing when handling dynamic input.
2. **No `@ts-ignore` or `@ts-expect-error`**: Never suppress type check errors. Fix the underlying type issue instead.
3. **Strict Compiler Options**: All projects (`backend`, `frontend`, `packages/types`, `packages/config`) MUST use:
   - `"strict": true`
   - `"noImplicitAny": true`
   - `"strictNullChecks": true`
   - `"noImplicitReturns": true`
   - `"noFallthroughCasesInSwitch": true`
   - `"noUncheckedIndexedAccess": true`
4. **Discriminated Unions**: For entities with multiple variations (e.g., `Question` with `multiple-choice` | `fill-blank` | `coding-challenge` | `code-output`), ALWAYS use a discriminated union on a literal `type` field rather than optional `any`/loose fields.
5. **Mongoose Timestamps & Property Declarations**: When using `@Schema({ timestamps: true })` on Mongoose document classes, you MUST explicitly declare timestamp properties on the class:
   ```ts
   readonly createdAt!: Date;
   readonly updatedAt!: Date;
   ```
   Never use `(doc as unknown as { createdAt: Date })` type assertions in repository mappers.
6. **Boundary Validation**: External inputs (`req.body`, `req.query`, AI LLM outputs, job payloads) MUST be validated using Zod at runtime before being cast to domain or application types.
