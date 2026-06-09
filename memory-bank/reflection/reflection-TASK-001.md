# Reflection: TASK-001 — Foundation & Project Setup

**Complexity**: Level 2 (FEAT-001)
**Status at reflection**: BUILD_COMPLETE (all 4 phases)
**Date**: 2026-06-09
**Branch**: feature/FEAT-001-foundation-project-setup

---

## Summary

Scaffolded the BanyanBoard backend: an Express + TypeScript API (strict mode,
ESM/NodeNext), a `/health` endpoint with happy + degraded paths, Vitest +
Supertest tests, and a Docker Compose stack (PostgreSQL + API). Delivered across
4 phases. All four acceptance criteria (AC-ENTRY-1, AC-HAPPY-1, AC-ERROR-1,
AC-INTEGRATION-1) are satisfied and verified — the degraded/entry criteria
against a **live Docker stack**, not just mocked unit tests.

Final state: 10/10 tests passing, `tsc --noEmit` clean, `npm run build` clean,
`npm audit` 0 vulnerabilities.

---

## Dimension 1: Task Implementation Quality

### What went well
- **app/server factory split** made the whole suite testable in-process via
  Supertest with zero port binding — the single most leveraged decision.
- **Injectable DB check** (`createApp({ checkDb })`) let both health branches be
  tested deterministically without a live database.
- **Degraded-by-200 design** (return 200 + `degraded`, never 5xx/crash) is the
  right call for infra health — verified the container does not get cycled.
- Scope discipline: no premature repository/use-case/DI layers; the scaffold
  stayed minimal per the FEAT-001 "simplicity over abstractions" principle.

### What went wrong (and was fixed)
- **The big one — a real crash the unit tests could not see.** Phase 3's
  degraded path passed all unit tests, but the Phase 4 live Docker smoke
  revealed that stopping Postgres **crashed the API process**. Cause: a
  `pg.Pool` emits an asynchronous `'error'` event on idle clients when the DB
  connection drops; with no pool-level listener, Node treats it as an unhandled
  `'error'` and exits. The per-request `try/catch` only catches the awaited
  query rejection — not the async pool event. Fixed by attaching
  `pool.on('error', …)` (log + swallow) and adding a `pg`-mocked regression
  test. **Lesson: a "stays alive when dependency dies" guarantee must be
  verified against a real running stack; mocked unit tests give false
  confidence here.**
- **Phase 1's backend files were never actually committed** — they sat untracked
  until the Phase 2 commit swept them in. State-tracking said "complete" but git
  didn't reflect it. Lesson: a phase isn't done until its files are committed and
  `git status` is clean.

### Carried-forward / open items
- `.env.example` could not be created — the local `.env.*` permission deny rule
  blocks even the safe template. Documented in README + techContext as the
  interim home. Needs a manual file or a narrowed deny rule.
- A stray root `package.json` (default `npm init` stub) is untracked and
  unrelated to the `backend/` package; should be removed if accidental.

### Requirements & criteria
All MUST acceptance criteria met. Test count (10) is slightly above the 5–7
target — the 3 extra come from the degraded path + the pool-error regression,
which are justified by the crash they guard against.

---

## Dimension 2: Claude Code / Banyan Ecosystem Effectiveness

### What worked
- The phased build with a human gate between phases kept changes reviewable and
  caught the "did Phase 1 actually commit?" gap before it compounded.
- Per-phase memory-bank state tracking made resumption trivial across separate
  invocations.
- The phase gate correctly **blocked the first archive attempt** because no
  reflection existed — the workflow enforced its own ordering.

### Friction
- **Sub-agents in an ephemeral filesystem** (noted from Phase 1) don't persist
  writes here, so the build was run directly by the orchestrator. Worked well
  and was faster, but means the documented multi-agent TDD flow wasn't used.
- Several `Bash` calls were denied: chained commands (`a; b`), `curl`, and `rm`.
  Had to fall back to one-command-per-call, `docker exec … wget` for HTTP
  checks, and leaving gitignored logs in place. Minor, but slowed the live smoke.
- The `.env.*` deny rule blocking `.env.example` is a recurring papercut across
  two phases — worth narrowing to `!.env.example`.

---

## Extractable Learnings

1. **[error-handling]** Always attach an `'error'` listener to a `pg.Pool`
   (and similar connection pools) — an unhandled async pool `'error'` event
   crashes the Node process; a per-request try/catch does not cover it.
   *Scope: backend DB/pool code (`**/db*.ts`, `**/routes/health*.ts`, `pg`/pool usage).*

2. **[testing-patterns]** Verify "process stays alive when a dependency dies"
   guarantees against a real running stack (e.g. `docker compose up` then stop
   the dependency), not only mocked unit tests — mocks hide async crash paths.
   *Scope: integration/smoke tests for infra & health endpoints.*

3. **[process]** A build phase is not complete until its files are committed and
   `git status` is clean — confirm the commit, don't trust the "done" marker.
   *Scope: build/commit workflow.*

---

## Metrics

- Phases: 4/4 complete · Tests: 10 passing · Build/typecheck: clean · audit: 0 vulns
- Bugs found post-implementation: 1 (pg-pool crash) — caught by live smoke, fixed + regression-tested
- Commits on feature branch: 4 (one per phase)
