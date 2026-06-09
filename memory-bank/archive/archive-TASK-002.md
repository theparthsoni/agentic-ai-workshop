# Archive: Board model + full CRUD endpoints + tests

## Metadata
- **Task ID**: TASK-002
- **Complexity**: Level 1 (user override — assessed Level 2)
- **Roadmap**: FEAT-002 (Board CRUD API)
- **Branch**: feature/board-crud
- **Completed**: 2026-06-09
- **Reflection**: `memory-bank/reflection/reflection-TASK-002.md`

## Summary
Added the first DB-backed domain resource to BanyanBoard: a `Board` model with a full CRUD
REST surface (`GET /boards`, `GET /boards/:id`, `POST /boards`, `PATCH /boards/:id`,
`DELETE /boards/:id`), backed by Postgres, with request validation, not-found handling, and
graceful store-error handling. This establishes the persistence/data-access and schema-bootstrap
pattern that columns, cards, and labels will build on.

## Solution
- **`BoardStore` interface** injected into `createBoardsRouter(store)` — same dependency-injection
  rationale as the existing `checkDb`. `InMemoryBoardStore` backs the tests (fast, deterministic,
  no live DB); `PgBoardStore` backs runtime.
- **`ensureBoardsSchema()`** runs `CREATE TABLE IF NOT EXISTS boards (...)` at startup — a
  lightweight, idempotent schema bootstrap. No migration tool introduced (deferred until a schema
  change needs ordering/rollback).
- **Validation** returns 400 (missing/blank/wrong-type name, no-op PATCH); missing ids return 404;
  unexpected store errors are caught → 500 (logged, process stays alive).
- **Partial PATCH** uses `COALESCE` for name and `CASE WHEN <provided-flag>` for description so an
  explicit `null` is distinguishable from an omitted field.

## Files Changed
- `backend/src/boards/board.ts` — `Board`, `CreateBoardInput`, `UpdateBoardInput` types (new)
- `backend/src/boards/boardStore.ts` — `BoardStore` interface + `InMemoryBoardStore` (new)
- `backend/src/boards/pgBoardStore.ts` — `PgBoardStore` + `ensureBoardsSchema()` + lazy default (new)
- `backend/src/routes/boards.ts` — CRUD router with validation (new)
- `backend/src/boards/__tests__/inMemoryBoardStore.test.ts` — 12 store unit tests (new)
- `backend/src/routes/__tests__/boards.test.ts` — 19 route tests via Supertest (new)
- `backend/src/app.ts` — mount boards router; `boardStore` dep added (modified)
- `backend/src/server.ts` — bootstrap schema before `listen()` (modified)
- `memory-bank/techContext.md`, `memory-bank/systemPatterns.md` — documented data-access pattern (modified)

## Verification
- `npm run typecheck` — clean
- `npm test` — **41/41 passing** (10 health + 19 boards routes + 12 store unit)
- Live Postgres CRUD smoke via `docker compose` — create/list/get/patch(name)/patch(desc=null)/
  delete + 400/404 cases all verified, including partial-PATCH null-vs-omitted semantics.

## Notes
- **Complexity**: built as Level 1 by explicit user override; assessed Level 2 (first persistence
  layer + a schema/migration design decision). Recorded on FEAT-002.
- **Known debt**: schema bootstrap is not a migration system; `GET /boards` has no pagination;
  `PgBoardStore` ordering (`created_at DESC`) shares the same ms-collision non-determinism the
  in-memory store had (untested tie-break) — add a `, id` tiebreak if it ever matters.
- **Process note**: a permission prompt during the live `curl` smoke corrupted
  `.claude/settings.local.json` (moved the entire `deny` list into `allow`); caught at commit time
  and reverted — never committed. Flagged in the reflection as a harness-level safety concern.
- Learnings extracted to `agent-rules/_learned/`: `testing-patterns.md` (insertion-order ordering;
  real-stack-over-mocks for SQL), `api-design.md` (PATCH null-vs-omitted via provided-flag).
