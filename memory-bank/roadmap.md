# Product Roadmap

## Summary
- **Total Features**: 1
- **Released Versions**: 0
- **Active Version**: None
- **Planning Backlog**: next (1 feature)

## Versions

### next (Planning)
- **Status**: planning
- **Description**: Backlog of features not yet assigned to a committed version
- **Features**:
  - FEAT-001: Foundation & Project Setup (in_progress) [Level 2]

## Features

### FEAT-001: Foundation & Project Setup
- **Version**: next
- **Status**: in_progress
- **Priority**: high
- **Complexity**: Level 2
- **Description**: Establish the project foundation — an Express API written in TypeScript, Docker Compose for a local PostgreSQL instance, a `/health` check endpoint backed by tests, and a basic clean-architecture project structure that favors simplicity over clever abstractions. This is the scaffolding milestone every later feature builds on.
- **Acceptance Criteria** (draft — refined during `/banyan-plan`):
  - Express + TypeScript API boots locally and serves requests
  - `docker compose up` brings up PostgreSQL (and optionally the API) for local development
  - `GET /health` returns a 200 with a basic status payload and is covered by automated tests
  - Project structure is in place (e.g., `backend/` with a clear src layout) and documented in `techContext.md`
- **Linked Tasks**: TASK-001 (planning complete)
- **Branch**: feature/FEAT-001-foundation-project-setup
- **Created**: 2026-06-09
