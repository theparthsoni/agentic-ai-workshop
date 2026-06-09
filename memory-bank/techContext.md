# Tech Context

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript (not yet scaffolded) |
| Backend | TypeScript / Express (REST API) |
| Database | PostgreSQL |
| Local orchestration | Docker Compose (`postgres:16-alpine` + `api` from `backend/Dockerfile`) |

### Backend dependencies (as of TASK-001 Phase 1)
- **Runtime**: `express` ^4.21, `pg` ^8.13
- **Dev/tooling**: `typescript` ^5.7, `vitest` ^4.1, `supertest` ^7, `tsx` ^4.19, `@types/*`
- Dependency audit: **0 known vulnerabilities** (Vitest upgraded to v4 to clear the dev-only esbuild/vite advisories).

## Architecture

- **Clean architecture**, favoring **simplicity over clever abstractions** — avoid premature layering.
- REST API between the React frontend (future) and the Express backend.
- PostgreSQL as the single source of truth (boards, columns, cards, labels, users).
- See `systemPatterns.md` for the app-factory/entrypoint split, ESM/NodeNext, and testing conventions.

## Component Structure

```
agent-ai-workshop/
├── docker-compose.yml           # postgres + api services (single-command startup)
├── README.md                    # run/test/env-var docs
├── backend/                     # Express + TypeScript API
│   ├── Dockerfile               # node:20-alpine + tsx (local-dev image)
│   ├── .dockerignore
│   ├── package.json             # ESM ("type": "module")
│   ├── tsconfig.json            # strict, ES2022, NodeNext; build excludes tests
│   ├── vitest.config.ts         # Vitest (node env)
│   └── src/
│       ├── app.ts               # createApp({ checkDb }) factory (no listen())
│       ├── server.ts            # entrypoint: reads PORT, app.listen()
│       ├── routes/
│       │   ├── health.ts        # GET /health (injectable DB check; pool 'error' guard)
│       │   └── __tests__/
│       │       ├── health.test.ts          # happy + degraded paths
│       │       └── defaultDbCheck.test.ts  # pg-mocked pool-error regression
│       └── __tests__/
│           └── app.smoke.test.ts  # Supertest smoke tests
├── .env.example                 # env var template (PENDING — blocked by .env.* deny rule; see note)
└── memory-bank/                 # Banyan memory bank (not shipped)
```
*(frontend/ arrives in a later task.)*

## Development Commands

Run from `backend/` (or via `npm --prefix backend <script>`):

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Run API with hot reload (`tsx watch src/server.ts`) |
| `npm test` | Run the test suite once (`vitest run`) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Type-check without emitting (`tsc --noEmit`) |
| `npm run build` | Compile to `dist/` (`tsc`) |
| `npm start` | Run compiled server (`node dist/server.js`) |

### Environment Variables
| Variable | Purpose | Local default |
|----------|---------|---------------|
| `PORT` | Port the API listens on | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://banyan:banyanpassword@localhost:5432/banyanboard` |

> **Note**: `.env.example` could not be written automatically — the `Edit(.env.*)` deny rule in `.claude/settings.local.json` blocks all `.env.*` files, including the safe template. Create it manually from the table above, or narrow the deny rule to exclude `.env.example`.

### Docker Compose Commands

Run from the repo root:

| Command | Purpose |
|---------|---------|
| `docker compose up -d --build` | Build + start `postgres` and `api` (detached) |
| `docker compose ps` | Show service status (both should be `healthy`) |
| `docker compose logs api` | Tail API logs (degraded-DB errors land here) |
| `docker compose stop postgres` | Stop the DB to exercise the degraded `/health` path |
| `docker compose down` | Stop and remove containers + network |

Health endpoint (after startup): `http://localhost:3000/health` →
`{"status":"ok","db":"connected"}` (DB up) or `{"status":"degraded","db":"unreachable"}` (DB down, HTTP 200, non-crashing).
