import { randomUUID } from 'node:crypto';
import type { Board, CreateBoardInput, UpdateBoardInput } from './board.js';

/**
 * Persistence boundary for boards.
 *
 * Injected into `createBoardsRouter` so the HTTP layer stays testable without a
 * live database — the same dependency-injection pattern used by `/health`'s
 * `checkDb`. `InMemoryBoardStore` backs the tests; `PgBoardStore` backs runtime.
 */
export interface BoardStore {
  list(): Promise<Board[]>;
  /** Returns the board, or `null` if no board has that id. */
  get(id: string): Promise<Board | null>;
  create(input: CreateBoardInput): Promise<Board>;
  /** Returns the updated board, or `null` if no board has that id. */
  update(id: string, input: UpdateBoardInput): Promise<Board | null>;
  /** Returns `true` if a board was deleted, `false` if none had that id. */
  remove(id: string): Promise<boolean>;
}

/**
 * In-memory `BoardStore` — used by tests and as a dependency-free fallback.
 * Not durable: data lives only for the lifetime of the process.
 */
export class InMemoryBoardStore implements BoardStore {
  private readonly boards = new Map<string, Board>();

  async list(): Promise<Board[]> {
    // Newest first. Map preserves insertion order, so reversing it is
    // deterministic even when two boards share a millisecond-resolution
    // createdAt (which a timestamp sort cannot disambiguate).
    return [...this.boards.values()].reverse();
  }

  async get(id: string): Promise<Board | null> {
    return this.boards.get(id) ?? null;
  }

  async create(input: CreateBoardInput): Promise<Board> {
    const now = new Date().toISOString();
    const board: Board = {
      id: randomUUID(),
      name: input.name,
      description: input.description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.boards.set(board.id, board);
    return board;
  }

  async update(id: string, input: UpdateBoardInput): Promise<Board | null> {
    const existing = this.boards.get(id);
    if (!existing) return null;
    const updated: Board = {
      ...existing,
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.boards.set(id, updated);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    return this.boards.delete(id);
  }
}
