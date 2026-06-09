import express, { type Express } from 'express';
import { createHealthRouter, type DbCheck } from './routes/health.js';
import { createBoardsRouter } from './routes/boards.js';
import type { BoardStore } from './boards/boardStore.js';

export interface AppDeps {
  /** DB connectivity check used by `/health`. Defaults to a real Postgres ping. */
  checkDb?: DbCheck;
  /** Persistence for `/boards`. Defaults to a Postgres-backed store. */
  boardStore?: BoardStore;
}

/**
 * Express application factory.
 *
 * Builds and returns the configured Express app WITHOUT binding to a port.
 * Keeping construction (`createApp`) separate from listening (`server.ts`)
 * lets tests drive the app in-process via Supertest without opening a socket.
 *
 * Dependencies (e.g. the DB check) are injected so routes stay testable.
 */
export function createApp(deps: AppDeps = {}): Express {
  const app = express();

  app.use(express.json());
  app.use(createHealthRouter(deps.checkDb));
  app.use(createBoardsRouter(deps.boardStore));

  return app;
}
