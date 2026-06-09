# Tech Context

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript |
| Backend | TypeScript / Express (REST API) |
| Database | PostgreSQL |
| Local orchestration | Docker Compose (full stack) |

## Architecture

- **Clean architecture**, but favoring **simplicity over clever abstractions** — avoid premature generalization and unnecessary layering.
- REST API between the React frontend and the Express backend.
- PostgreSQL as the single source of truth (boards, columns, cards, labels, users).

## Development Commands
[To be added once the project scaffolding exists — expected to be `docker compose up` for local run]

## Component Structure
[To be added as the codebase takes shape — anticipated: `frontend/` (React) and `backend/` (Express) with a shared types boundary]
