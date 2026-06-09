# BanyanBoard

A self-hostable Kanban board. This repository currently contains the project
foundation: an Express + TypeScript API, a Dockerized PostgreSQL instance, and
a `/health` check endpoint.

## Prerequisites

- Docker Desktop (or Docker Engine + the Compose plugin)
- Node.js LTS (≥ 20) — only needed to run tests locally outside Docker

## Run the full stack (Docker Compose)

From the repository root:

```bash
docker compose up -d
```

This starts two services:

| Service    | Port | Description                          |
|------------|------|--------------------------------------|
| `postgres` | 5432 | PostgreSQL 16 (alpine)               |
| `api`      | 3000 | BanyanBoard API (Express/TypeScript) |

Check that both are healthy:

```bash
docker compose ps
```

Hit the health endpoint:

```bash
curl http://localhost:3000/health
# {"status":"ok","db":"connected"}
```

The API degrades gracefully when the database is down — it stays alive and
reports a degraded status instead of crashing:

```bash
docker compose stop postgres
curl http://localhost:3000/health
# {"status":"degraded","db":"unreachable"}   (still HTTP 200)
```

Tear down:

```bash
docker compose down
```

## Run the API locally (without Docker)

```bash
cd backend
npm install
npm run dev        # tsx watch — restarts on change
```

The API reads its configuration from environment variables (see below). For a
local run, point `DATABASE_URL` at a reachable PostgreSQL instance.

## Run the tests

```bash
cd backend
npm test           # vitest run (one-shot)
npm run test:watch # watch mode
npm run typecheck  # tsc --noEmit (strict, zero errors)
```

The `/health` test suite (`src/routes/__tests__/health.test.ts`) covers both the
happy path and the DB-unreachable degraded path using Supertest against the
in-process Express app — no live database required.

## Environment variables

> **Note:** A committed `.env.example` is the intended home for this reference,
> but creating it is currently blocked by a local permission rule on `.env.*`.
> The variables are documented here until that file can be added manually.

| Variable            | Default (Compose)                                             | Purpose                                      |
|---------------------|---------------------------------------------------------------|----------------------------------------------|
| `PORT`              | `3000`                                                        | Port the API listens on                      |
| `DATABASE_URL`      | `postgres://banyan:banyanpassword@postgres:5432/banyanboard` | Connection string for the `/health` DB check |
| `POSTGRES_DB`       | `banyanboard`                                                | PostgreSQL database name                     |
| `POSTGRES_USER`     | `banyan`                                                     | PostgreSQL user                              |
| `POSTGRES_PASSWORD` | `banyanpassword`                                             | PostgreSQL password                          |

When running the API outside Docker, use `localhost` instead of `postgres` as
the database host in `DATABASE_URL`.

## Project structure

```
.
├── docker-compose.yml      # postgres + api services
├── backend/
│   ├── Dockerfile          # local-dev image (node:20-alpine + tsx)
│   ├── src/
│   │   ├── app.ts          # Express app factory (no listen)
│   │   ├── server.ts       # entrypoint — app.listen()
│   │   └── routes/
│   │       └── health.ts   # GET /health
│   └── ...
└── memory-bank/            # Banyan Memory Bank (planning & docs)
```
