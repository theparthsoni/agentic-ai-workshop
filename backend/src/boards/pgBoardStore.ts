import { Pool, type QueryResultRow } from 'pg';
import type { Board, CreateBoardInput, UpdateBoardInput } from './board.js';
import type { BoardStore } from './boardStore.js';

let defaultPool: Pool | undefined;

/**
 * Lazily-created shared pool for the default board store. Mirrors the pool in
 * `health.ts`: a `pg.Pool` MUST have an `'error'` listener, otherwise an async
 * error on an idle client (e.g. Postgres restart) is treated as unhandled and
 * crashes the process.
 */
function getDefaultPool(): Pool {
  if (!defaultPool) {
    defaultPool = new Pool({ connectionString: process.env.DATABASE_URL });
    defaultPool.on('error', (err) => {
      console.error('[boards] idle pg client error:', err);
    });
  }
  return defaultPool;
}

/**
 * Creates the `boards` table if it does not already exist. This is the
 * project's lightweight schema-bootstrap step — no migration tool is
 * introduced (simplicity over abstraction). Idempotent; safe to call on every
 * startup. `gen_random_uuid()` is built into Postgres 13+.
 */
export async function ensureBoardsSchema(pool: Pool = getDefaultPool()): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS boards (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name        text NOT NULL,
      description text,
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now()
    );
  `);
}

interface BoardRow extends QueryResultRow {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

function rowToBoard(row: BoardRow): Board {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

/**
 * Postgres-backed `BoardStore`. Call `ensureBoardsSchema` once at startup
 * before serving requests.
 */
export function createPgBoardStore(pool: Pool = getDefaultPool()): BoardStore {
  return {
    async list(): Promise<Board[]> {
      const { rows } = await pool.query<BoardRow>(
        'SELECT * FROM boards ORDER BY created_at DESC',
      );
      return rows.map(rowToBoard);
    },

    async get(id: string): Promise<Board | null> {
      const { rows } = await pool.query<BoardRow>(
        'SELECT * FROM boards WHERE id = $1',
        [id],
      );
      return rows[0] ? rowToBoard(rows[0]) : null;
    },

    async create(input: CreateBoardInput): Promise<Board> {
      const { rows } = await pool.query<BoardRow>(
        'INSERT INTO boards (name, description) VALUES ($1, $2) RETURNING *',
        [input.name, input.description ?? null],
      );
      return rowToBoard(rows[0]);
    },

    async update(id: string, input: UpdateBoardInput): Promise<Board | null> {
      // COALESCE keeps the existing column when the param is NULL, so callers
      // can update name and description independently. `description` is set
      // explicitly only when provided (a separate flag distinguishes
      // "not provided" from an intentional NULL).
      const { rows } = await pool.query<BoardRow>(
        `UPDATE boards
            SET name        = COALESCE($2, name),
                description = CASE WHEN $3 THEN $4 ELSE description END,
                updated_at  = now()
          WHERE id = $1
        RETURNING *`,
        [
          id,
          input.name ?? null,
          input.description !== undefined,
          input.description ?? null,
        ],
      );
      return rows[0] ? rowToBoard(rows[0]) : null;
    },

    async remove(id: string): Promise<boolean> {
      const { rowCount } = await pool.query('DELETE FROM boards WHERE id = $1', [id]);
      return (rowCount ?? 0) > 0;
    },
  };
}

let defaultStore: BoardStore | undefined;

/** Lazily-created default (Postgres) board store for runtime use. */
export function getDefaultBoardStore(): BoardStore {
  if (!defaultStore) defaultStore = createPgBoardStore();
  return defaultStore;
}
