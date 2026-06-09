---
name: "Learned: Testing Patterns"
globs: ["**/*.test.ts", "**/__tests__/**"]
topics: ["testing", "integration-testing", "resilience"]
priority: low
evidence_count: 1
last_updated: 2026-06-09
auto_generated: true
---

# Testing Patterns

- Verify "process stays alive when a dependency dies" guarantees against a real running stack (e.g. `docker compose up` then stop the dependency), not only mocked unit tests — mocks hide async crash paths.

## Evidence

| Learning | Source | Date |
|----------|--------|------|
| Degraded-path unit tests passed but the API still crashed on real DB drop | [reflection-TASK-001.md](../../reflection/reflection-TASK-001.md) | 2026-06-09 |
