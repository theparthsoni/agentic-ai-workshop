---
name: "Learned: API Design"
globs: ["**/routes/**", "**/*Store.ts", "**/*store.ts"]
topics: ["api-design", "database", "rest"]
priority: low
evidence_count: 1
last_updated: 2026-06-09
auto_generated: true
---

# API Design

- For partial updates (PATCH), distinguish "field omitted" from "field explicitly set to null" — pass a provided-flag and use `CASE WHEN $flag THEN $val ELSE col END`, not `COALESCE($val, col)` alone (COALESCE cannot represent an intentional null).

## Evidence

| Learning | Source | Date |
|----------|--------|------|
| PATCH /boards needed to set description=null vs leave it unchanged | [reflection-TASK-002.md](../../reflection/reflection-TASK-002.md) | 2026-06-09 |
