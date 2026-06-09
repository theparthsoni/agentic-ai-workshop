---
name: "Learned: Testing Patterns"
globs: ["**/*.test.ts", "**/__tests__/**"]
topics: ["testing", "integration-testing", "resilience"]
priority: medium
evidence_count: 3
last_updated: 2026-06-09
auto_generated: true
---

# Testing Patterns

- Verify behavior against a real running stack (e.g. `docker compose up`), not only mocked unit tests — mocks hide async crash paths AND never execute real SQL/data-access code. Add a live DB smoke for any new persistence path before considering it done.
- Order in-memory test collections by insertion order, not by millisecond-resolution timestamps — same-millisecond creations collide and make "newest first" assertions non-deterministic.

## Evidence

| Learning | Source | Date |
|----------|--------|------|
| Degraded-path unit tests passed but the API still crashed on real DB drop | [reflection-TASK-001.md](../../reflection/reflection-TASK-001.md) | 2026-06-09 |
| Mocked board tests never ran the SQL; live PG smoke validated CRUD + partial-PATCH paths | [reflection-TASK-002.md](../../reflection/reflection-TASK-002.md) | 2026-06-09 |
| Two "newest first" tests failed on same-ms createdAt; fixed via insertion-order sort | [reflection-TASK-002.md](../../reflection/reflection-TASK-002.md) | 2026-06-09 |
