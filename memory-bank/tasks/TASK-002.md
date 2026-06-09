# TASK-002: Board model with full CRUD endpoints + comprehensive tests

**Complexity**: Level 1 (user override — assessed Level 2; see note below)
**Status**: REFLECTION_COMPLETE
**Reflection**: memory-bank/reflection/reflection-TASK-002.md
**Roadmap**: N/A
**Branch**: feature/board-crud
**Worktree**: N/A (Level 1 uses direct branch, not worktree)

## Task Description

Create a Board model with full CRUD endpoints (GET all, GET by id, POST, PATCH, DELETE) and comprehensive tests.

## Complexity Note

Complexity evaluation landed on **Level 2** (first DB-backed resource — establishes the
schema-bootstrap and data-access pattern; 5–10 files). The user explicitly chose to override
to Level 1 and build directly, skipping the roadmap/plan phase.

## Implementation Notes

Follows existing backend conventions (TASK-001):
- App-factory with injectable dependencies (mirrors the `checkDb` injection in `/health`).
- `BoardStore` interface injected into `createBoardsRouter(store)`; `InMemoryBoardStore` for
  tests (no live DB), `PgBoardStore` for runtime.
- Schema bootstrapped via `ensureBoardsSchema(pool)` (`CREATE TABLE IF NOT EXISTS`) — no
  migration tool introduced (simplicity over abstraction).
- ESM `.js` import specifiers, strict TS, Vitest + Supertest, tests co-located under `__tests__/`.

### Board model
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid (string) | server-generated (`gen_random_uuid()` / `crypto.randomUUID()`) |
| `name` | string | required, non-empty |
| `description` | string \| null | optional |
| `createdAt` | ISO timestamp | server-set |
| `updatedAt` | ISO timestamp | server-set, bumped on update |

### Endpoints
| Method | Path | Success | Errors |
|--------|------|---------|--------|
| GET | `/boards` | 200 `[Board]` | — |
| GET | `/boards/:id` | 200 `Board` | 404 |
| POST | `/boards` | 201 `Board` | 400 |
| PATCH | `/boards/:id` | 200 `Board` | 404, 400 |
| DELETE | `/boards/:id` | 204 | 404 |

---

## Execution State

**Build Status**: IDLE
**Current Phase**: REFLECT → ARCHIVE
**Can Resume**: NO

### Active Sub-Agents
(none — Level 1, direct build)

### Completed Steps
- [x] Task created, branch confirmed (feature/board-crud)
- [x] Board types + store interface
- [x] InMemoryBoardStore + PgBoardStore + ensureBoardsSchema
- [x] boards router (5 endpoints + validation)
- [x] Wire into app.ts / server.ts
- [x] Tests (route + store) — 31 new tests
- [x] typecheck + test suite green (41/41 passing)
- [x] Live Postgres CRUD smoke (docker compose) — all paths verified

### Verification
- `npm run typecheck` — clean
- `npm test` — 41/41 passing (10 health + 19 boards routes + 12 store unit)
- Live smoke against `docker compose` Postgres: create/list/get/patch(name)/patch(desc=null)/delete + 400/404 cases all correct
