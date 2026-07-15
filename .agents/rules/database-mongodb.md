# Database & MongoDB Rule

## Core Principles
1. **MongoDB Only**: The project uses **MongoDB 8.x + Mongoose**. Never suggest, import, or configure PostgreSQL, Prisma, TypeORM, or SQL databases.
2. **No `Schema.Types.Mixed`**: Every field in Mongoose Schemas must be explicitly typed. Avoid `Mixed`. If absolutely required by dynamic external payloads, it must be validated via Zod and documented.
3. **Clean Architecture Separation**:
   - **Domain Layer**: Only defines plain TypeScript entities, value objects, and Repository interfaces (`IQuestionRepository`). NO Mongoose imports or decorators allowed here.
   - **Infrastructure Layer**: Implements Repository interfaces using Mongoose (`QuestionRepositoryImpl`), mapping MongoDB Documents to pure Domain entities using explicit mappers.
4. **Embed vs Reference**:
   - **Embed**: Data always queried with parent, small and bounded size (`QuestionOption` inside `Question`).
   - **Reference (ObjectId)**: Shared references or potentially large lists (`Tag`, `Category`, `Company`, `User`).
   - **Separate Collections**: Unbounded growth items (`Attempt`, `Discussion`, `Vote`, `Submission`) MUST be in separate collections.
5. **Multi-Document Transactions**: Use MongoDB sessions/transactions for multi-step atomic operations across collections (e.g., Contest Submission + Ranking update + Attempt deduction). Requires replica set topology.
6. **No Direct Controller Queries**: Controllers must NEVER inject Mongoose models or execute database queries directly. Always route through Application Use-Cases / CQRS Handlers.
