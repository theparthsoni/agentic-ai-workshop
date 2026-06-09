import { Router, type Request, type Response } from 'express';
import type { CreateBoardInput, UpdateBoardInput } from '../boards/board.js';
import type { BoardStore } from '../boards/boardStore.js';
import { getDefaultBoardStore } from '../boards/pgBoardStore.js';

type Valid<T> = { ok: true; value: T };
type Invalid = { ok: false; error: string };

function isPlainObject(body: unknown): body is Record<string, unknown> {
  return typeof body === 'object' && body !== null && !Array.isArray(body);
}

function validateCreate(body: unknown): Valid<CreateBoardInput> | Invalid {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }
  const { name, description } = body;
  if (typeof name !== 'string' || name.trim().length === 0) {
    return { ok: false, error: 'name is required and must be a non-empty string.' };
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    return { ok: false, error: 'description must be a string or null.' };
  }
  return { ok: true, value: { name: name.trim(), description: description ?? null } };
}

function validateUpdate(body: unknown): Valid<UpdateBoardInput> | Invalid {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }
  const fields: UpdateBoardInput = {};
  if ('name' in body) {
    const { name } = body;
    if (typeof name !== 'string' || name.trim().length === 0) {
      return { ok: false, error: 'name must be a non-empty string.' };
    }
    fields.name = name.trim();
  }
  if ('description' in body) {
    const { description } = body;
    if (description !== null && typeof description !== 'string') {
      return { ok: false, error: 'description must be a string or null.' };
    }
    fields.description = description;
  }
  if (Object.keys(fields).length === 0) {
    return { ok: false, error: 'No updatable fields provided (name, description).' };
  }
  return { ok: true, value: fields };
}

/**
 * Builds the `/boards` CRUD router. The store is injectable so the routes can
 * be exercised against an in-memory store in tests (no live DB), mirroring the
 * `checkDb` injection used by `/health`.
 */
export function createBoardsRouter(store: BoardStore = getDefaultBoardStore()): Router {
  const router = Router();

  router.get('/boards', async (_req: Request, res: Response) => {
    try {
      res.status(200).json(await store.list());
    } catch (err) {
      console.error('[boards] list failed:', err);
      res.status(500).json({ error: 'Failed to list boards.' });
    }
  });

  router.get('/boards/:id', async (req: Request, res: Response) => {
    try {
      const board = await store.get(req.params.id);
      if (!board) {
        res.status(404).json({ error: 'Board not found.' });
        return;
      }
      res.status(200).json(board);
    } catch (err) {
      console.error('[boards] get failed:', err);
      res.status(500).json({ error: 'Failed to fetch board.' });
    }
  });

  router.post('/boards', async (req: Request, res: Response) => {
    const result = validateCreate(req.body);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    try {
      const board = await store.create(result.value);
      res.status(201).json(board);
    } catch (err) {
      console.error('[boards] create failed:', err);
      res.status(500).json({ error: 'Failed to create board.' });
    }
  });

  router.patch('/boards/:id', async (req: Request, res: Response) => {
    const result = validateUpdate(req.body);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    try {
      const board = await store.update(req.params.id, result.value);
      if (!board) {
        res.status(404).json({ error: 'Board not found.' });
        return;
      }
      res.status(200).json(board);
    } catch (err) {
      console.error('[boards] update failed:', err);
      res.status(500).json({ error: 'Failed to update board.' });
    }
  });

  router.delete('/boards/:id', async (req: Request, res: Response) => {
    try {
      const deleted = await store.remove(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'Board not found.' });
        return;
      }
      res.status(204).end();
    } catch (err) {
      console.error('[boards] delete failed:', err);
      res.status(500).json({ error: 'Failed to delete board.' });
    }
  });

  return router;
}
