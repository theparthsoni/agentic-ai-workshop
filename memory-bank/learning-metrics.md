# Learning Metrics

## Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| Max learned rule files | 10 | Hard cap on files in `agent-rules/_learned/` |
| Expiry period (days) | 90 | Remove unreinforced bullets after this period |
| Promotion threshold | 3 | Promote to `medium` priority at this evidence count |
| Max bullets per file | 15 | Prune to 10 most-evidenced when exceeded |

## Task History

| Task ID | Date | Learnings Extracted | Rules Amended | Rules Created |
|---------|------|--------------------:|-------------:|-------------:|
| TASK-001 | 2026-06-09 | 3 | 0 | 3 |
| TASK-002 | 2026-06-09 | 3 | 1 | 1 |

## Rule Effectiveness

| File | Topics | Evidence Count | Priority | Last Updated |
|------|--------|---------------:|:--------:|:------------:|
| error-handling.md | error-handling, database, resilience | 1 | low | 2026-06-09 |
| testing-patterns.md | testing, integration-testing, resilience | 3 | low | 2026-06-09 |
| build-process.md | process, git, workflow | 1 | low | 2026-06-09 |
| api-design.md | api-design, database, rest | 1 | low | 2026-06-09 |

## Consolidation History

| Date | Rules Before | Rules After | Merged | Expired | Promoted |
|------|------------:|------------:|-------:|--------:|---------:|
| 2026-06-09 | 3 | 3 | 0 | 0 | 0 |
