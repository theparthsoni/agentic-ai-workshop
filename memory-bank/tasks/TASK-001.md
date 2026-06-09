# TASK-001: Foundation & Project Setup

**Complexity**: Level 2 (inherited from FEAT-001)
**Status**: COMPLETE
**Reflection**: memory-bank/reflection/reflection-TASK-001.md
**Archived**: memory-bank/archive/archive-TASK-001.md
**Completed**: 2026-06-09
**Roadmap**: FEAT-001
**Branch**: feature/FEAT-001-foundation-project-setup
**Worktree**: N/A (working in main tree on the feature branch)

## Task Description

Establish the project foundation for BanyanBoard — an Express API written in
TypeScript, Docker Compose for a local PostgreSQL instance, a `/health` check
endpoint backed by automated tests, and a basic clean-architecture project
structure that favors simplicity over clever abstractions. This is the
scaffolding milestone every later feature builds on.

## Specification

**Feature Type**: NFR/Infrastructure
**Primary Persona**: Alex — Self-hosting Operator / Developer (from productBrief.md). Alex clones the repo, runs `docker compose up`, and verifies the stack is healthy before any application features are built.
**Creative Exploration Needed**: No — this is conventional Express+TypeScript scaffolding with well-established patterns. All structural decisions below are concrete recommendations the human can adjust; none require UX exploration.

### Invocation Method

For an NFR/Infrastructure feature, "invocation" means the sequence of commands a developer runs to verify the foundation is working:

| Step | Command | Expected outcome |
|------|---------|-----------------|
| 1 | `git clone <repo> && cd agent-ai-workshop` | Repo checked out |
| 2 | `docker compose up -d` | PostgreSQL + API containers start; `docker compose ps` shows both healthy |
| 3 | `curl http://localhost:3000/health` | HTTP 200 with `{"status":"ok","db":"connected"}` |
| 4 | `docker compose stop postgres` then `curl http://localhost:3000/health` | HTTP 200 (process alive) with `{"status":"degraded","db":"unreachable"}` (non-crashing degraded state) |
| 5 | `npm --prefix backend test` (or `cd backend && npm test`) | All tests pass; health-route tests cover happy path and DB-unreachable path |
| 6 | `npm --prefix backend run build` | TypeScript compiles with zero errors under `strict: true` |

**Confidence**: HIGH — standard developer workflow for any Docker Compose + Express + TypeScript project.

### Success Criteria

| Metric | Target | Verifiable at |
|--------|--------|---------------|
| `GET /health` response code | HTTP 200 | `curl -o /dev/null -s -w "%{http_code}" http://localhost:3000/health` |
| `GET /health` response body (DB up) | `{"status":"ok","db":"connected"}` | Response body |
| `GET /health` response time (local) | < 100ms p95 | Supertest timing assertion in test |
| `GET /health` degraded (DB down) | `{"status":"degraded","db":"unreachable"}` — non-crashing | Response body; process still alive |
| TypeScript strict compilation | Zero errors | `npx tsc --noEmit` exit code 0 |
| Automated test suite | All tests pass (green) | `npm test` exit code 0 |
| Docker Compose stack | Both services healthy | `docker compose ps` — both show `running`/`healthy` |

**Verification frequency**: One-time validation after scaffold is created; subsequently on every CI run.
**Observable at**: Terminal output of `npm test`; `http://localhost:3000/health`; `docker compose ps`.

### Acceptance Criteria

#### AC-ENTRY-1: Developer can start the full stack with a single command
**Priority**: MUST
**Given** the developer has Docker and Docker Compose installed and has cloned the repository
**When** they run `docker compose up -d` from the repository root
**Then**:
  - Both services (`postgres` and `api`) start without error
  - `docker compose ps` shows both services in `running` or `healthy` state
  - The API is reachable at `http://localhost:3000` within 30 seconds of startup
  - No manual database setup or environment variable editing is required beyond the repo defaults

**Verification**:
- [ ] `docker compose up -d` exits cleanly (exit code 0)
- [ ] `docker compose ps` shows both services up
- [ ] `curl http://localhost:3000/health` returns HTTP 200 after startup

#### AC-HAPPY-1: GET /health returns 200 with a JSON status payload and is covered by passing tests
**Priority**: MUST
**Given** the API is running and PostgreSQL is reachable
**When** a client issues `GET /health`
**Then**:
  - The response status code is `200`
  - The response `Content-Type` header is `application/json`
  - The response body is `{"status":"ok","db":"connected"}` (or equivalent schema)
  - The endpoint responds in under 100ms on a local machine

**Given** the test suite is run with `npm test`
**When** all tests execute
**Then**:
  - The health-route test file (`backend/src/routes/__tests__/health.test.ts` or equivalent) passes
  - The test uses Supertest to make a real HTTP request — not a stub — and asserts the exact status code and JSON shape
  - TypeScript strict mode is enabled (`strict: true` in `tsconfig.json`) and the build produces zero errors

**Verification**:
- [ ] `npm test` exits with code 0
- [ ] Test asserts `status === 200` and body contains `status: "ok"`
- [ ] `npx tsc --noEmit` exits with code 0
- [ ] Test file exists at the specified path and is not a stub placeholder

#### AC-ERROR-1: When the database is unreachable, /health returns a degraded status without crashing
**Priority**: MUST
**Given** the API process is running but the PostgreSQL container is stopped or unreachable
**When** a client issues `GET /health`
**Then**:
  - The response status code is `200` (process is alive and responding)
  - The response body signals degraded state — e.g., `{"status":"degraded","db":"unreachable"}`
  - The API process does NOT crash or exit
  - The error is logged server-side (visible in `docker compose logs api`) but the endpoint still returns a structured response

**Given** the test suite contains an AC-ERROR-1 test case
**When** it runs against a mocked/disconnected DB connection
**Then**:
  - The test asserts the degraded response shape (not HTTP 500, not a crash)
  - The test is NOT a stub — it actually simulates DB failure (e.g., by injecting a failing DB check)

**Verification**:
- [ ] Test file includes a test case that mocks DB unavailability and asserts `{"status":"degraded",...}`
- [ ] Manual verification: stop postgres, curl health, confirm degraded JSON returned and API process still alive
- [ ] `docker compose logs api` shows a logged error (not silent failure)

#### AC-INTEGRATION-1: TypeScript project compiles cleanly and structure matches clean-architecture conventions
**Priority**: MUST
**Given** the backend directory exists with the recommended file layout (see Recommended Tooling & Structure)
**When** the developer runs `npx tsc --noEmit` (or `npm run build`) in `backend/`
**Then**:
  - TypeScript compiles with `strict: true` and zero errors
  - The directory structure includes `src/app.ts`, `src/server.ts`, `src/routes/health.ts`, and the recommended layout
  - No `any` type escapes are present in the scaffolded files (enforced by `noImplicitAny: true`)

**Verification**:
- [ ] `npx tsc --noEmit` exits with code 0
- [ ] `ls backend/src/routes/health.ts` exists
- [ ] `grep -r "any" backend/src/` produces no results in scaffolded files (excluding test utilities if needed)

### Scope Boundaries

**In scope**:
- `backend/` directory: Express+TypeScript API scaffold with `src/app.ts`, `src/server.ts`, `src/routes/health.ts`
- `backend/package.json` with all runtime and dev dependencies
- `backend/tsconfig.json` with `strict: true`
- `docker-compose.yml` with `postgres` and `api` services
- `.env.example` listing required env vars (DB credentials, PORT)
- `GET /health` endpoint (happy path + degraded path)
- Automated tests: Vitest (recommended) or Jest + Supertest covering AC-HAPPY-1 and AC-ERROR-1
- Dev runner configured (`tsx --watch` or `ts-node-dev`)
- README update: how to run locally, how to run tests

**Out of scope**:
- React frontend scaffolding (separate task)
- Database schema / migrations (future task — first feature that needs tables)
- Authentication / authorization middleware
- Any application routes beyond `/health`
- CI/CD pipeline configuration (may be added as a follow-on)
- Production Docker image / multi-stage build (can be deferred)
- Logging library beyond `console.error` for MVP scaffold (keep simple)

**Dependencies**:
- Docker Desktop (or Docker Engine + Compose plugin) installed on developer machine
- Node.js LTS (≥ 20) installed for running tests locally outside Docker

**NFR implications**:
- This task establishes the `strict: true` TypeScript baseline — all future backend code inherits this constraint
- The `docker compose` service definitions set defaults (ports, DB name/user/password) that all later features rely on; changes will be breaking
- No performance or security NFRs apply at scaffold stage beyond the < 100ms health response time

### Recommended Tooling & Structure

**All choices below are DECISIONS the human can adjust before the build phase begins.**

#### File Layout (recommended)

```
agent-ai-workshop/
├── docker-compose.yml          # Decision: single compose file at repo root
├── .env.example                # Required env vars with safe defaults
├── backend/
│   ├── package.json            # Decision: separate backend package (not monorepo root)
│   ├── tsconfig.json           # strict: true, target: ES2022, module: NodeNext
│   ├── src/
│   │   ├── app.ts              # Express app factory (no listen() call here)
│   │   ├── server.ts           # Entrypoint: calls app.listen()
│   │   └── routes/
│   │       ├── health.ts       # GET /health handler
│   │       └── __tests__/
│   │           └── health.test.ts  # Supertest tests for AC-HAPPY-1, AC-ERROR-1
│   └── dist/                   # Compiled output (gitignored)
└── memory-bank/                # Existing (not modified by this task)
```

**Rationale**: Separating `app.ts` (factory) from `server.ts` (entrypoint) is the minimal clean-architecture split that makes Supertest testing work cleanly without binding a real port — a well-established Express pattern. No additional layers (repositories, use-cases, services) are needed for the scaffold.

#### Tool Choices (DECISIONS — adjustable)

| Concern | Recommended | Alternative | Rationale |
|---------|-------------|-------------|-----------|
| Test runner | **Vitest** | Jest | Vitest is the 2026 standard for TS projects; zero config, native ESM, faster. Jest remains valid if team prefers. |
| HTTP testing | **Supertest** | `fetch` + real server | Supertest works with Express apps directly without binding a port |
| Dev runner | **tsx --watch** | ts-node-dev, nodemon+ts-node | `tsx` is lightweight, maintained, requires no extra config |
| TypeScript target | **ES2022 / NodeNext** | CommonJS | NodeNext modules are the modern Node.js default; avoids CJS/ESM friction |
| DB client (health check) | **pg** (node-postgres) | Prisma, Drizzle | `pg` is minimal for a health ping; ORM can be added when schema work begins |
| Postgres image | **postgres:16-alpine** | postgres:latest | Pinned minor version for reproducibility; alpine for smaller image |
| Port | **3000** (API), **5432** (DB) | configurable via env | Conventional defaults; exposed via `.env.example` |

#### docker-compose.yml services (recommended shape)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: banyanboard
      POSTGRES_USER: banyan
      POSTGRES_PASSWORD: banyanpassword
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U banyan -d banyanboard"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://banyan:banyanpassword@postgres:5432/banyanboard
      PORT: 3000
    depends_on:
      postgres:
        condition: service_healthy
```

**Decision**: The `api` service is built from `./backend/Dockerfile` for local Docker Compose runs. A simple `Dockerfile` using `node:20-alpine` + `tsx` for dev is sufficient at this stage. (Alternatively, the API service can be omitted from compose and run locally with `npm run dev` — adjust if preferred.)

#### /health endpoint contract (recommended)

```typescript
// GET /health — happy path
// HTTP 200
{ "status": "ok", "db": "connected" }

// GET /health — degraded (DB unreachable)
// HTTP 200  (the process is alive; do NOT use 5xx here for infrastructure health)
{ "status": "degraded", "db": "unreachable" }
```

**Decision on status code for degraded**: Return HTTP 200 (not 503) so that load balancers / restart policies do not cycle the container when only the DB is down. This is a convention choice — teams using Kubernetes liveness vs readiness probes might prefer 200/503 split; flag this if a Kubernetes deployment is anticipated.

#### systemPatterns.md note

Since `systemPatterns.md` is currently empty/placeholder, this task is the first opportunity to establish foundational architecture conventions. The Documentation Agent during the build phase should record the following in `systemPatterns.md`:
- `app.ts` (factory) / `server.ts` (entrypoint) split as the standard Express pattern
- Test files co-located under `src/**/__tests__/`
- Environment variables sourced from `.env` (not hardcoded); `.env.example` committed to repo
- `strict: true` TypeScript as the project-wide baseline

### Confidence Assessment

| Field | Confidence | Notes |
|-------|------------|-------|
| Feature type classification | HIGH | Unambiguous NFR/Infrastructure |
| Primary persona | HIGH | Alex (Operator/Developer) is explicitly defined in productBrief.md |
| File layout | HIGH | Standard Express+TS pattern; no ambiguity |
| Tool choices (Vitest, Supertest, tsx) | HIGH | Well-established 2026 TS ecosystem defaults |
| Docker Compose service definitions | HIGH | Conventional; all values concrete |
| /health endpoint contract | HIGH | JSON shape is simple and well-defined |
| HTTP status for degraded state | MEDIUM | 200 vs 503 is a legitimate design decision — flagged above as a decision point |
| Whether API runs in Docker Compose vs local npm dev | MEDIUM | Both are valid; recommendation given but human should confirm |
| Test file locations | HIGH | Co-located `__tests__/` is the Jest/Vitest convention |
| TypeScript config (strict, target) | HIGH | `strict: true` + ES2022/NodeNext is the modern baseline |

**Creative Phase Recommended**: No. All decisions are concrete and conventional. The one MEDIUM-confidence item (200 vs 503 for degraded health) is a documented decision point, not a creative problem.

### Confirmed Decisions (human review, 2026-06-09)

The two MEDIUM-confidence decision points and the tooling choice were resolved during planning review:

| Decision | Resolution |
|----------|------------|
| Test runner | **Vitest** + Supertest (confirmed) |
| Degraded `/health` status code (DB down) | **HTTP 200** with `{"status":"degraded","db":"unreachable"}` (confirmed — keeps container alive) |
| API in Docker Compose | **Both `api` + `postgres` run in Compose** (`api` built from `backend/Dockerfile`); satisfies AC-ENTRY-1 single-command goal (confirmed) |
| Dev runner | `tsx --watch` |
| DB client (health ping) | `pg` (node-postgres) |
| Postgres image | `postgres:16-alpine` |
| TypeScript | `strict: true`, target ES2022, module NodeNext |

Spec **approved as-is** by the human. No creative phase. Proceed to build after planning completes.

## User Journey Definition

**Feature Type**: NFR/Infrastructure
**Creative Phase Required**: No

### NFR Verification (Infrastructure Features)

- **Test method**: `docker compose up -d` brings up PostgreSQL and the API; `npm --prefix backend test` (Vitest + Supertest) runs the `/health` test suite covering both the happy path and the DB-unreachable path; a manual `curl http://localhost:3000/health` confirms the running endpoint.
- **Success metrics**:
  - `GET /health` returns HTTP 200 with `{"status":"ok","db":"connected"}` in < 100ms locally
  - `GET /health` returns `{"status":"degraded","db":"unreachable"}` (HTTP 200, non-crashing) when PostgreSQL is stopped
  - Full test suite (`npm test`) passes with zero failures
  - TypeScript compiles with zero errors under `strict: true` (`npx tsc --noEmit` exit 0)
  - `docker compose up -d` + `docker compose ps` shows both services healthy within 30 seconds
- **Observable at**: Terminal output of `npm test`; running API at `http://localhost:3000/health`; `docker compose ps` showing both `postgres` and `api` services healthy.
- **Verification frequency**: One-time after scaffold is created; continuous on every CI run.

### Acceptance Criteria

#### AC-ENTRY-1: Developer can start the full stack with a single command
**Priority**: MUST
**Given** the developer has Docker + Compose installed and has cloned the repository
**When** they run `docker compose up -d` from the repo root
**Then**:
  - Both `postgres` and `api` services start without error
  - `docker compose ps` shows both services healthy
  - `curl http://localhost:3000/health` returns HTTP 200 within 30 seconds

**Verification**:
- [ ] `docker compose up -d` exits with code 0
- [ ] `docker compose ps` shows both services running/healthy
- [ ] Health endpoint reachable with HTTP 200 after startup

#### AC-HAPPY-1: GET /health returns 200 with a JSON status payload and is covered by passing automated tests
**Priority**: MUST
**Given** the API is running and PostgreSQL is reachable
**When** a client issues `GET /health`
**Then**:
  - Response status is `200`
  - Response `Content-Type` is `application/json`
  - Response body is `{"status":"ok","db":"connected"}` (exact schema)
  - Response time is < 100ms locally

**Given** `npm test` (or `npm --prefix backend test`) is run
**When** the test suite executes
**Then**:
  - `health.test.ts` uses Supertest against the real Express app (not a stub) and asserts status 200 and JSON body
  - `npx tsc --noEmit` exits with code 0 (strict mode, zero errors)
  - All tests pass (exit code 0)

**Verification**:
- [ ] `npm test` exits with code 0
- [ ] Test asserts `status === 200` and body shape `{status: "ok", db: "connected"}`
- [ ] `npx tsc --noEmit` exits with code 0
- [ ] Test file at `backend/src/routes/__tests__/health.test.ts` exists and is a real Supertest test (not a placeholder)

#### AC-ERROR-1: When the database is unreachable, /health reports a degraded status without crashing
**Priority**: MUST
**Given** the API process is running but PostgreSQL is stopped/unreachable
**When** a client issues `GET /health`
**Then**:
  - Response status is `200` (process still alive)
  - Response body is `{"status":"degraded","db":"unreachable"}` (or equivalent degraded schema)
  - The API process does NOT crash or exit
  - An error is logged server-side (visible in `docker compose logs api`)

**Given** the test suite includes a DB-failure test case
**When** it runs with a mocked/failing DB connection
**Then**:
  - Test asserts the degraded JSON body (not HTTP 500, not a crash)
  - Test is a real assertion against mocked DB failure — not a stub that always passes

**Verification**:
- [ ] Test case exists that mocks DB failure and asserts `{status: "degraded", db: "unreachable"}`
- [ ] Manual: stop postgres container, curl health, confirm degraded JSON returned and API still running
- [ ] `docker compose logs api` shows a logged error (not silent failure)

#### AC-INTEGRATION-1: TypeScript project compiles cleanly and file layout matches the recommended structure
**Priority**: MUST
**Given** the backend scaffold is created
**When** `npx tsc --noEmit` runs in the `backend/` directory
**Then**:
  - Compilation succeeds with zero errors under `strict: true`
  - Files `backend/src/app.ts`, `backend/src/server.ts`, `backend/src/routes/health.ts`, and `backend/src/routes/__tests__/health.test.ts` all exist
  - No `any` type escapes are present in scaffolded source files

**Verification**:
- [ ] `npx tsc --noEmit` exits with code 0
- [ ] All four key files exist at the specified paths
- [ ] `grep -rn ": any" backend/src/*.ts backend/src/**/*.ts` returns no results in non-test files

## Test Strategy

### Approach
- **Emphasis**: Integration (HTTP-level via Supertest) — for a scaffold, the meaningful behavior is the `/health` route's real HTTP response, not isolated unit functions. Vitest + Supertest exercise the Express app in-process (no port binding).
- **Target test count**: 5–7 total. Justification: this is a scaffold with a single endpoint; AC-HAPPY-1 and AC-ERROR-1 are the substantive behaviors. Over-testing a scaffold adds maintenance cost for no value.

### File Organization
- **New test files**:
  - `backend/src/routes/__tests__/health.test.ts` — covers AC-HAPPY-1 (200 + `{status:"ok",db:"connected"}`) and AC-ERROR-1 (DB-down → 200 + `{status:"degraded",db:"unreachable"}`, non-crashing). Uses Supertest against the `app` factory; the DB check is injected/mocked so the unreachable path is deterministic (no real DB stop needed in unit run).
- **Extend existing**: None (greenfield — no existing test files).

### What NOT to Test
- `server.ts` `listen()` binding — covered by the Docker Compose smoke check (AC-ENTRY-1), not a unit test; binding a real port in tests is flaky and low-value.
- PostgreSQL itself / the `pg` driver — third-party, out of scope; we test only our health handler's branching on a connected vs failing DB check.
- TypeScript type correctness — enforced by `tsc --noEmit` in CI/build (AC-INTEGRATION-1), not by runtime tests.
- Docker Compose orchestration internals — verified manually / by the AC-ENTRY-1 smoke step, not automated here (CI compose smoke can be a follow-on).

### Per-Phase Test Guidance
- **Phase 1 (Scaffold + tooling)**: 0 behavioral tests — establish config; a trivial "app boots / returns 404 on unknown route" sanity test is optional (counts toward total if added).
- **Phase 2 (/health happy path)**: 2–3 tests — 200 status, `application/json` content type, exact body `{status:"ok",db:"connected"}`, and the DB-connected check path is invoked.
- **Phase 3 (/health degraded path)**: 2 tests — DB-check failure injected → 200 with `{status:"degraded",db:"unreachable"}`; assert process/handler does not throw (returns structured response) and error is logged.
- **Phase 4 (Docker Compose)**: 0 automated unit tests — verified via the AC-ENTRY-1 manual smoke sequence (`docker compose up -d`, `curl /health`, stop postgres, re-curl).

## Implementation Roadmap

- [x] **Phase 1 — Project scaffold & tooling** ✅ (2026-06-09)
  - Created `backend/package.json` (deps: `express`, `pg`; devDeps: `typescript`, `vitest`@4, `supertest`, `@types/*`, `tsx`), `backend/tsconfig.json` (`strict: true`, target ES2022, module NodeNext), root `.gitignore`, `backend/vitest.config.ts`.
  - Created `backend/src/app.ts` (Express app factory — `express.json()`, **no** `listen()`), `backend/src/server.ts` (reads `PORT` from env, calls `app.listen()`), and `backend/src/__tests__/app.smoke.test.ts` (2 Supertest smoke tests).
  - npm scripts: `dev`, `build`, `start`, `test`, `test:watch`, `typecheck`.
  - **Verified**: tests 2/2 pass · `tsc --noEmit` clean · `tsc` build → `dist/` · `npm audit` 0 vulnerabilities.
  - **Known gap**: `.env.example` NOT created — blocked by the `Edit(.env.*)` deny rule. Documented in techContext.md; create manually or narrow the deny rule. (No app routes / `/health` yet — Phase 2.)
  - Maps to: AC-INTEGRATION-1 (file layout + strict compile) — satisfied.

- [x] **Phase 2 — `/health` happy path + tests** ✅ (2026-06-09)
  - Added `backend/src/routes/health.ts`: `createHealthRouter(checkDb)` with injectable `DbCheck`; default `defaultDbCheck()` runs `SELECT 1` via a lazy `pg.Pool`. `GET /health` awaits the check and returns `200 {status:"ok",db:"connected"}`.
  - Wired the health route into `app.ts` via `createApp({ checkDb })` (injectable dependency).
  - Wrote `backend/src/routes/__tests__/health.test.ts`: 4 Supertest happy-path cases (200 status, `application/json`, exact body, <100ms) using an injected passing DB check.
  - **Verified**: tests 6/6 pass (2 smoke + 4 health) · `tsc --noEmit` clean.
  - Maps to: AC-HAPPY-1 — satisfied (degraded path deferred to Phase 3).

- [x] **Phase 3 — `/health` degraded path + error handling** ✅ (2026-06-09)
  - Wrapped the `checkDb()` call in try/catch: on failure, log via `console.error` and return `200 {status:"degraded",db:"unreachable"}` — never throws/crashes.
  - Added 3 degraded-path tests (injected failing DB check): 200 status (not 500), exact degraded body, and `console.error` called. `console.error` is spied/silenced per test.
  - **Verified**: tests 9/9 pass (2 smoke + 4 happy + 3 degraded) · `tsc --noEmit` clean.
  - Maps to: AC-ERROR-1 — satisfied.

- [x] **Phase 4 — Docker Compose + local-run docs** ✅ (2026-06-09)
  - Created `docker-compose.yml` (`postgres:16-alpine` + `pg_isready` healthcheck; `api` built from `backend/Dockerfile`, `depends_on` postgres healthy, env `DATABASE_URL`/`PORT`, plus an `api` wget healthcheck on `/health`).
  - Created `backend/Dockerfile` (`node:20-alpine`, `npm ci`, run via `npx tsx src/server.ts`) and `backend/.dockerignore`.
  - Created root `README.md`: single-command startup, local (non-Docker) run, test commands, full env-var reference, project structure.
  - **Live smoke test (AC-ENTRY-1 + closes AC-ERROR-1 loop)**: `docker compose up -d --build` → both services `healthy`; `/health` → `{"status":"ok","db":"connected"}`; `docker compose stop postgres` → **API stays Up (healthy)** and returns `{"status":"degraded","db":"unreachable"}`; errors logged server-side.
  - **Bug found & fixed during live test**: stopping postgres originally **crashed** the API — a `pg.Pool` emits an async `'error'` event on idle clients when the DB drops, and with no pool-level listener Node treats it as unhandled and exits. Fixed in `health.ts` by attaching `pool.on('error', …)` (log + swallow). Added a `pg`-mocked regression test (`defaultDbCheck.test.ts`). This crash was invisible to the injected-checker unit tests — only the real Docker run surfaced it.
  - **`.env.example` still NOT created** — `Write`/`Edit` on `.env.*` remains blocked by the local permission deny rule. Env vars are fully documented in `README.md` as the interim home; create the file manually or narrow the deny rule.
  - Maps to: AC-ENTRY-1 (single-command startup) — satisfied.

### Observability Requirements
- **Applies**: Minimal (scaffold). The `/health` handler logs DB-check failures via `console.error` per the MVP "keep simple" scope boundary. Full OpenTelemetry/structured logging is **out of scope** for this task and deferred to a later infrastructure task. Note: the project's observability standards (per CLAUDE.md) will apply once real service code lands.

### API Requirements
- **REST API**: Yes (minimal) → a single `GET /health` endpoint. No request body, no auth. An OpenAPI spec is **not** required for this scaffold task but can be introduced when the first real resource endpoints (boards/cards) are built.
- **GraphQL API**: No.

## Creative Phases
- No creative phase required (Level 2, infrastructure scaffolding with conventional approach; spec approved at HIGH confidence).

---

## Build Execution State

**Build Status**: IDLE
**Current Phase**: COMPLETE
**Build Started**: 2026-06-09
**Phase Number**: 4 of 4
**Is Multi-Phase**: YES

### Current Build Step
**Step**: ARCHIVED — task closed
**Status**: COMPLETE
**Completed**: 2026-06-09

### Completed Steps
- Planning: COMPLETE — spec approved, 4-phase roadmap authored
- Step 0.5 Git Setup: COMPLETE — branch feature/FEAT-001-foundation-project-setup; baseline commit; no remote (local-merge); main working tree
- Step 0.6 Phase Gate: COMPLETE — roadmap populated; no required creative phases
- Step 1 Read Task Context: COMPLETE — Phase 1 of 4, Level 2
- Step 2 Load Context: COMPLETE — level2-implementation rules
- Step 3 Test Writer: COMPLETE — smoke test authored (note: sub-agent output did not persist; recreated by orchestrator)
- Step 4 Coding Agent: COMPLETE — scaffold authored (note: sub-agent output did not persist; orchestrator wrote files directly to disk)
- Step 7 Integration Verification: COMPLETE — tests 2/2, typecheck clean, build → dist/, audit 0 vulns (Vitest upgraded v2→v4)
- Step 8 Code Review: COMPLETE (inline) — approved; no blocking issues; no injection surface yet
- Step 9 Documentation: COMPLETE — systemPatterns.md + techContext.md populated with foundational conventions
- Step 10 Memory Bank: COMPLETE — Phase 1 marked done in roadmap, registry, progress

### Sub-Agents
- Spec Writer (Sonnet): COMPLETE (planning)
- Test Writer (Sonnet): reported COMPLETE but files did not persist → orchestrator recreated
- Coding Agent (Sonnet): reported COMPLETE but files did not persist → orchestrator recreated & verified

### Resumption Notes
**Can Resume**: NO (COMPLETE — archived)
**Resume From**: N/A
**Notes**: Built directly by the orchestrator (Level 1, no sub-agents per user instruction). All ACs verified: AC-INTEGRATION-1 (strict compile), AC-HAPPY-1 (ok/connected + tests), AC-ERROR-1 (degraded/unreachable, non-crashing — **live-verified** in Docker after fixing a pg-pool unhandled-error crash), AC-ENTRY-1 (single-command Docker startup, both services healthy). 10/10 tests pass, build + typecheck clean. Open item: `.env.example` blocked by `.env.*` permission deny rule (documented in README + techContext).
