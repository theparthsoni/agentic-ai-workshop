# Product Roadmap

## Summary
- **Total Features**: 2
- **Released Versions**: 0
- **Active Version**: None
- **Planning Backlog**: next (2 features)

## Versions

### next (Planning)
- **Status**: planning
- **Description**: Backlog of features not yet assigned to a committed version
- **Features**:
  - FEAT-001: Foundation & Project Setup (complete) [Level 2]
  - FEAT-002: Board CRUD API (complete) [Level 2]

## Features

### FEAT-001: Foundation & Project Setup
- **Version**: next
- **Status**: complete
- **Priority**: high
- **Complexity**: Level 2
- **Description**: Establish the project foundation — an Express API written in TypeScript, Docker Compose for a local PostgreSQL instance, a `/health` check endpoint backed by tests, and a basic clean-architecture project structure that favors simplicity over clever abstractions. This is the scaffolding milestone every later feature builds on.
- **Acceptance Criteria** (draft — refined during `/banyan-plan`):
  - Express + TypeScript API boots locally and serves requests
  - `docker compose up` brings up PostgreSQL (and optionally the API) for local development
  - `GET /health` returns a 200 with a basic status payload and is covered by automated tests
  - Project structure is in place (e.g., `backend/` with a clear src layout) and documented in `techContext.md`
- **Linked Tasks**: TASK-001 (COMPLETE — archived 2026-06-09)
- **Branch**: feature/FEAT-001-foundation-project-setup
- **Created**: 2026-06-09

### FEAT-002: Board CRUD API
- **Version**: next
- **Status**: complete
- **Priority**: high
- **Complexity**: Level 2
- **Description**: Add Board CRUD API endpoints with input validation and error handling. The first DB-backed domain resource — a `Board` model with GET (all/by-id), POST, PATCH, DELETE endpoints, backed by Postgres via an injectable `BoardStore`, with request validation (400), not-found (404), and store-error (500) handling. Establishes the persistence/data-access and schema-bootstrap pattern for all later resources (columns, cards, labels).
- **Linked Tasks**: TASK-002 (COMPLETE — archived 2026-06-09; 41/41 tests, live Postgres smoke)
- **Branch**: feature/board-crud (actual work branch; created before roadmap link, retained rather than renamed to feature/FEAT-002-board-crud-api)
- **Created**: 2026-06-09
- **Note**: Created retroactively after the work was built as a Level 1 override task. Assessed Level 2.
