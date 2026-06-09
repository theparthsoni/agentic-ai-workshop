# Tech Context

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript (not yet scaffolded) |
| Backend | TypeScript / Express (REST API) |
| Database | PostgreSQL |
| Local orchestration | Docker Compose (planned — Phase 4 of TASK-001) |

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
├── backend/                     # Express + TypeScript API
│   ├── package.json             # ESM ("type": "module")
│   ├── tsconfig.json            # strict, ES2022, NodeNext; build excludes tests
│   ├── vitest.config.ts         # Vitest (node env)
│   └── src/
│       ├── app.ts               # createApp() factory (no listen())
│       ├── server.ts            # entrypoint: reads PORT, app.listen()
│       └── __tests__/
│           └── app.smoke.test.ts  # Supertest smoke tests
├── .env.example                 # env var template (PENDING — blocked by Edit(.env.*) deny rule; see note)
└── memory-bank/                 # Banyan memory bank (not shipped)
```
*(frontend/, docker-compose.yml, and Dockerfile arrive in later phases/tasks.)*

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

> Docker Compose commands (`docker compose up -d`, etc.) will be added in TASK-001 Phase 4.
