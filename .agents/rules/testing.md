# Testing Rule

## Core Principles
1. **Mandatory Tests**: Every Pull Request and new module MUST include comprehensive automated tests.
2. **Domain & Application Layer Unit Tests**:
   - Every Domain Entity, Value Object, and Use-Case (`Command`/`Query` handler) MUST have unit tests covering both positive and negative scenarios.
   - Use mock repositories when testing Use-Cases to isolate application logic from database infrastructure.
3. **SM-2 Spaced Repetition Testing**: Ensure mathematical calculations for difficulty grading (`correct`, `durationMs`, previous interval/e-factor) are rigorously unit tested.
4. **Integration & E2E Tests**:
   - Controllers and global interceptors/pipes must be tested using NestJS integration test suites with mock database/Redis layers or `mongodb-memory-server`.
5. **Strict Type-Safe Mocks**: Test mocks must strictly satisfy domain repository interfaces without resorting to `any` casts.
