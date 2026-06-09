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
  if (!defaultPool) {
    defaultPool = new Pool({ connectionString: process.env.DATABASE_URL });
    // pg pools emit an async 'error' event when an *idle* client's connection
    // drops (e.g. Postgres restarts/stops). Without a listener Node treats it
    // as an unhandled 'error' and crashes the process — defeating the whole
    // point of the degraded health check. Swallow + log instead.
    defaultPool.on('error', (err) => {
      console.error('[health] idle pg client error:', err);
    });
  }
  return defaultPool.query('SELECT 1');
}

/**
 * Builds the `/health` router. The DB check is injectable so the happy path
 * (and, in Phase 3, the degraded path) can be exercised without a real DB.
 */
export function createHealthRouter(checkDb: DbCheck = defaultDbCheck): Router {
  const router = Router();

  router.get('/health', async (_req: Request, res: Response) => {
    try {
      await checkDb();
      res.status(200).json({ status: 'ok', db: 'connected' });
    } catch (err) {
      // DB unreachable: report degraded but stay alive (HTTP 200, never crash)
      // so load balancers / restart policies don't cycle the container.
      console.error('[health] DB check failed:', err);
      res.status(200).json({ status: 'degraded', db: 'unreachable' });
    }
  });

  return router;
}
