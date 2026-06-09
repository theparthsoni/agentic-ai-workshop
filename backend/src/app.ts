import express, { type Express } from 'express';
import { createHealthRouter, type DbCheck } from './routes/health.js';

export interface AppDeps {
  /** DB connectivity check used by `/health`. Defaults to a real Postgres ping. */
  checkDb?: DbCheck;
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

  return app;
}
