# System Patterns

## Architecture Patterns

### Backend (Express + TypeScript)
- **App factory / entrypoint split** — `backend/src/app.ts` exports `createApp()` which builds and returns the Express `Application` **without** calling `listen()`. `backend/src/server.ts` is the process entrypoint that imports the factory and binds the port. This keeps the app testable in-process via Supertest (no socket binding in tests).
- **Clean architecture, kept simple** — favor the minimal structure that works. Routes live under `src/routes/`. Do NOT introduce repository/use-case/DI layers until a concrete need appears (per FEAT-001 guiding principle: simplicity over clever abstractions).
- **ESM throughout** — `"type": "module"` + TypeScript `module/moduleResolution: NodeNext`. Intra-package relative imports use explicit `.js` extensions (e.g. `import { createApp } from './app.js'`), which NodeNext maps to the `.ts` source.

### Health checks & graceful degradation
- **`/health` reports, it does not fail** — infrastructure health returns HTTP **200** in both the healthy (`{"status":"ok","db":"connected"}`) and degraded (`{"status":"degraded","db":"unreachable"}`) states. A degraded dependency must never produce a 5xx or crash the process, so load balancers / restart policies don't cycle a container that is itself fine.
- **Injectable dependency checks** — `createApp({ checkDb })` and `createHealthRouter(checkDb)` accept the DB check as a parameter; the default pings Postgres with `SELECT 1`. Tests inject a passing/failing stub so both health branches are deterministic without a live DB.
- **`pg.Pool` MUST have an `'error'` listener** — a pool emits an asynchronous `'error'` event on idle clients when the DB connection drops (Postgres restart/stop). With no listener, Node treats it as an unhandled `'error'` and **crashes the process**. Always attach `pool.on('error', …)` (log + swallow). The per-request `try/catch` is NOT sufficient — it only catches the awaited query, not the async pool event. (Discovered in TASK-001 Phase 4 via live Docker test; mocked unit tests did not surface it.)
- **Infra "stays-alive" guarantees need a real integration smoke** — verify crash-resistance against a real running stack (`docker compose up`, then stop the dependency), not just mocked unit tests.

### Data access & persistence (introduced TASK-002, Board CRUD)
- **Store interface injected into routers** — each DB-backed resource defines a `*Store` interface (e.g. `BoardStore`) with the CRUD methods, injected into `create*Router(store)`. This is the **same dependency-injection rationale as `checkDb`**: tests run against an `InMemory*Store` (fast, deterministic, no live DB), runtime uses the `Pg*Store`. This is the "concrete need" that justifies a thin data-access layer — it is NOT the repository/use-case/DI layering that `techContext` warns against.
- **Store contract for "not found"** — read/update return `null` and delete returns `false` when the id is absent; the router maps those to HTTP **404**. Validation failures are **400**; unexpected store errors are caught and returned as **500** (logged via `console.error`, process stays alive) rather than crashing.
- **Schema bootstrap via `ensure*Schema(pool)`** — `CREATE TABLE IF NOT EXISTS`, idempotent, called once at startup in `server.ts` before `listen()`. No migration tool is introduced yet (simplicity over abstraction); revisit when schema changes need ordering/rollback. A schema-init failure logs and still starts the server (degrade, don't crash).
- **Postgres specifics** — UUID PKs via built-in `gen_random_uuid()` (PG13+); rows map to camelCase DTOs with `timestamptz → ISO string`. Partial PATCH uses `COALESCE($n, col)` for name and a `CASE WHEN <provided-flag> THEN $n ELSE col END` for description, so an explicit `null` is distinguishable from an omitted field. **Verified against live Postgres** (TASK-002), not just mocked tests.
- **In-memory ordering** — `InMemoryBoardStore.list()` returns reverse insertion order (Map preserves insertion order) for deterministic "newest first", because millisecond-resolution `createdAt` timestamps collide and cannot be sorted reliably.

## Conventions

- **TypeScript `strict: true`** is the project-wide baseline (`target: ES2022`). New backend code must compile clean under strict with no `any` escapes.
- **Tests are co-located** under `src/**/__tests__/` and named `*.test.ts`. They are excluded from the `tsc` build (`dist/` ships only runtime code) but run by Vitest.
- **Test stack**: Vitest (runner) + Supertest (HTTP-level assertions against the `createApp()` factory).
- **Configuration via environment** — runtime config (e.g. `PORT`, `DATABASE_URL`) is read from `process.env` with sensible local defaults; never hardcode secrets. A committed `.env.example` documents required vars (see techContext.md). No real `.env` is committed.
- **Logging** — `console` statements are avoided in application code; the single startup log in `server.ts` is the deliberate exception for the scaffold. Structured/OpenTelemetry logging is deferred until real service code lands.

### Containerization (local dev)
- **Single `docker-compose.yml` at repo root** brings up the full stack with one command (`docker compose up -d`). Services: `postgres` (`postgres:16-alpine`, `pg_isready` healthcheck) and `api` (built from `backend/Dockerfile`, `depends_on: postgres healthy`, wget healthcheck on `/health`).
- **Dev image runs TS directly** — `backend/Dockerfile` uses `node:20-alpine` + `npm ci` + `npx tsx src/server.ts`. A production multi-stage build is deferred (out of scope for the scaffold).
- **Config flows through Compose env** — `DATABASE_URL`/`PORT` are set per-service in `docker-compose.yml`; the DB host is `postgres` inside Compose vs `localhost` for a local non-Docker run.

> Established in TASK-001 (FEAT-001) Phases 1–4. Extend this file as new patterns emerge in later phases/features.
