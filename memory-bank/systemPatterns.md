# System Patterns

## Architecture Patterns

### Backend (Express + TypeScript)
- **App factory / entrypoint split** — `backend/src/app.ts` exports `createApp()` which builds and returns the Express `Application` **without** calling `listen()`. `backend/src/server.ts` is the process entrypoint that imports the factory and binds the port. This keeps the app testable in-process via Supertest (no socket binding in tests).
- **Clean architecture, kept simple** — favor the minimal structure that works. Routes live under `src/routes/`. Do NOT introduce repository/use-case/DI layers until a concrete need appears (per FEAT-001 guiding principle: simplicity over clever abstractions).
- **ESM throughout** — `"type": "module"` + TypeScript `module/moduleResolution: NodeNext`. Intra-package relative imports use explicit `.js` extensions (e.g. `import { createApp } from './app.js'`), which NodeNext maps to the `.ts` source.

## Conventions

- **TypeScript `strict: true`** is the project-wide baseline (`target: ES2022`). New backend code must compile clean under strict with no `any` escapes.
- **Tests are co-located** under `src/**/__tests__/` and named `*.test.ts`. They are excluded from the `tsc` build (`dist/` ships only runtime code) but run by Vitest.
- **Test stack**: Vitest (runner) + Supertest (HTTP-level assertions against the `createApp()` factory).
- **Configuration via environment** — runtime config (e.g. `PORT`, `DATABASE_URL`) is read from `process.env` with sensible local defaults; never hardcode secrets. A committed `.env.example` documents required vars (see techContext.md). No real `.env` is committed.
- **Logging** — `console` statements are avoided in application code; the single startup log in `server.ts` is the deliberate exception for the scaffold. Structured/OpenTelemetry logging is deferred until real service code lands.

> Established in TASK-001 (FEAT-001) Phase 1. Extend this file as new patterns emerge in later phases/features.
