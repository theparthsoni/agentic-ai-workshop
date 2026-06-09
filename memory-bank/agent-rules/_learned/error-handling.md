---
name: "Learned: Error Handling"
globs: ["**/db*.ts", "**/routes/health*.ts", "**/*pool*.ts"]
topics: ["error-handling", "database", "resilience"]
priority: low
evidence_count: 1
last_updated: 2026-06-09
auto_generated: true
---

# Error Handling

- Always attach an `'error'` listener to a `pg.Pool` (or similar connection pool); an unhandled async pool `'error'` event crashes the Node process, and a per-request try/catch does not cover it.

## Evidence

| Learning | Source | Date |
|----------|--------|------|
| pg.Pool idle-client error crashed the API; fixed with pool.on('error', …) | [reflection-TASK-001.md](../../reflection/reflection-TASK-001.md) | 2026-06-09 |
