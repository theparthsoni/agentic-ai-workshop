import { createApp } from './app.js';
import { ensureBoardsSchema } from './boards/pgBoardStore.js';

const app = createApp();
const port = Number(process.env.PORT) || 3000;

async function start(): Promise<void> {
  try {
    // Bootstrap the boards schema (idempotent CREATE TABLE IF NOT EXISTS).
    await ensureBoardsSchema();
  } catch (err) {
    // Stay alive on a schema-init failure — matching the project's "degrade,
    // don't crash" stance for infra. Board endpoints will surface 500s until
    // the DB is reachable; /health continues to report degraded.
    console.error('[server] boards schema init failed (continuing):', err);
  }

  app.listen(port, () => {
    // Startup log — the one place a console statement is acceptable in the scaffold.
    console.log(`BanyanBoard API listening on port ${port}`);
  });
}

void start();
