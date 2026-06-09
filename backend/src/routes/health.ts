import { Router, type Request, type Response } from 'express';
import { Pool } from 'pg';

/**
 * A DB connectivity check: resolves when the database is reachable.
 * Injected into the health route so tests can run without a live DB.
 */
export type DbCheck = () => Promise<unknown>;

let defaultPool: Pool | undefined;

/** Default check: a lightweight `SELECT 1` against the configured Postgres. */
export function defaultDbCheck(): Promise<unknown> {
  defaultPool ??= new Pool({ connectionString: process.env.DATABASE_URL });
  return defaultPool.query('SELECT 1');
}

/**
 * Builds the `/health` router. The DB check is injectable so the happy path
 * (and, in Phase 3, the degraded path) can be exercised without a real DB.
 */
export function createHealthRouter(checkDb: DbCheck = defaultDbCheck): Router {
  const router = Router();

  router.get('/health', async (_req: Request, res: Response) => {
    await checkDb();
    res.status(200).json({ status: 'ok', db: 'connected' });
  });

  return router;
}
