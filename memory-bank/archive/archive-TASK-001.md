# Archive: TASK-001 — Foundation & Project Setup

**Complexity**: Level 2 (FEAT-001)
**Status**: COMPLETE
**Archived**: 2026-06-09
**Branch**: feature/FEAT-001-foundation-project-setup (merged to main, local-merge)
**Reflection**: memory-bank/reflection/reflection-TASK-001.md

---

## Overview

Established the BanyanBoard backend foundation: an Express + TypeScript API
(strict mode, ESM/NodeNext), a `/health` endpoint covering both healthy and
degraded states, Vitest + Supertest tests, and a Docker Compose stack
(PostgreSQL 16 + API). This is the scaffolding milestone all later features
build on.

All four acceptance criteria satisfied and verified (degraded/entry against a
live Docker stack). Final state: 10/10 tests passing, `tsc --noEmit` clean,
`npm run build` clean, `npm audit` 0 vulnerabilities.

---

## Implementation Roadmap (all phases complete)

| Phase | Scope | Maps to | Commit |
|-------|-------|---------|--------|
| 1 | Project scaffold & tooling (package.json, tsconfig strict, vitest, app/server split, smoke test) | AC-INTEGRATION-1 | (swept into Phase 2 commit) |
| 2 | `/health` happy path + tests (injectable DB check, 200 `{ok,connected}`) | AC-HAPPY-1 | d614d39 |
| 3 | `/health` degraded path + error handling (200 `{degraded,unreachable}`, non-crashing) | AC-ERROR-1 | e36b23c |
| 4 | Docker Compose + Dockerfile + README; pg-pool crash fix | AC-ENTRY-1 | 4a8fe07 |

Reflection commit: 4ed91d7.

---

## Key Artifacts

- `backend/src/app.ts` — `createApp({ checkDb })` factory (no `listen()`)
- `backend/src/server.ts` — entrypoint
- `backend/src/routes/health.ts` — `/health` with injectable DB check + `pool.on('error')` guard
- `backend/src/routes/__tests__/health.test.ts` — happy + degraded paths
- `backend/src/routes/__tests__/defaultDbCheck.test.ts` — pg-mocked pool-error regression
- `docker-compose.yml`, `backend/Dockerfile`, `backend/.dockerignore`, `README.md`

---

## Acceptance Criteria — Final Status

| AC | Description | Status | Verification |
|----|-------------|--------|--------------|
| AC-ENTRY-1 | Single-command full-stack startup | ✅ | `docker compose up -d --build` → both services healthy; `/health` 200 |
| AC-HAPPY-1 | `/health` 200 `{ok,connected}` + passing tests | ✅ | Supertest + live curl-equivalent |
| AC-ERROR-1 | DB down → degraded, non-crashing, logged | ✅ | Live: stopped postgres, API stayed Up, returned `{degraded,unreachable}` |
| AC-INTEGRATION-1 | Strict TS compiles clean, layout matches | ✅ | `tsc --noEmit` exit 0 |

---

## Key Learnings (see reflection for detail)

1. **pg.Pool needs an `'error'` listener** — an unhandled async pool `'error'`
   event (idle client, DB drops) crashes Node; a per-request try/catch does not
   cover it. Found via live Docker smoke, not unit tests.
2. **Verify "stays-alive" guarantees against a real stack** — mocked unit tests
   gave false confidence; only the running container surfaced the crash.
3. **A phase isn't done until committed & `git status` clean** — Phase 1's
   backend sat untracked despite being marked complete.

Extracted into `agent-rules/_learned/`: error-handling.md, testing-patterns.md,
build-process.md.

---

## Carried-Forward Items (not blocking)

- **`.env.example` not created** — blocked by the local `.env.*` permission deny
  rule. Env vars documented in README + techContext. Create manually or narrow
  the deny rule to `!.env.example`.
- **Stray root `package.json`** — a default `npm init` stub, unrelated to the
  `backend/` package; left untracked. Remove if accidental.

---

## Out of Scope (deferred to later tasks)

React frontend, DB schema/migrations, auth, application routes beyond `/health`,
CI/CD, production multi-stage Docker image, structured/OpenTelemetry logging.
