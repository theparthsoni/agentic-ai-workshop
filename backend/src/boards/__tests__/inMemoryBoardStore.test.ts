import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryBoardStore } from '../boardStore.js';

let store: InMemoryBoardStore;

beforeEach(() => {
  store = new InMemoryBoardStore();
});

describe('InMemoryBoardStore.create', () => {
  it('assigns an id and timestamps', async () => {
    const board = await store.create({ name: 'A', description: 'desc' });
    expect(board.id).toEqual(expect.any(String));
    expect(board.name).toBe('A');
    expect(board.description).toBe('desc');
    expect(board.createdAt).toEqual(expect.any(String));
    expect(board.updatedAt).toBe(board.createdAt);
  });

  it('defaults description to null', async () => {
    const board = await store.create({ name: 'A' });
    expect(board.description).toBeNull();
  });

  it('generates unique ids', async () => {
    const a = await store.create({ name: 'A' });
    const b = await store.create({ name: 'B' });
    expect(a.id).not.toBe(b.id);
  });
});

describe('InMemoryBoardStore.get', () => {
  it('returns the board when present', async () => {
    const created = await store.create({ name: 'A' });
    expect(await store.get(created.id)).toEqual(created);
  });

  it('returns null when absent', async () => {
    expect(await store.get('nope')).toBeNull();
  });
});

describe('InMemoryBoardStore.list', () => {
  it('returns an empty array initially', async () => {
    expect(await store.list()).toEqual([]);
  });

  it('returns boards newest first', async () => {
    const a = await store.create({ name: 'A' });
    const b = await store.create({ name: 'B' });
    const ids = (await store.list()).map((board) => board.id);
    expect(ids).toEqual([b.id, a.id]);
  });
});

describe('InMemoryBoardStore.update', () => {
  it('merges provided fields and bumps updatedAt', async () => {
    const created = await store.create({ name: 'Old', description: 'keep' });
    const updated = await store.update(created.id, { name: 'New' });
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('New');
    expect(updated?.description).toBe('keep');
    expect(updated?.createdAt).toBe(created.createdAt);
    // updatedAt is >= createdAt (monotonic ISO strings compare lexicographically).
    expect(updated!.updatedAt >= created.updatedAt).toBe(true);
  });

  it('can set description to null', async () => {
    const created = await store.create({ name: 'A', description: 'had' });
    const updated = await store.update(created.id, { description: null });
    expect(updated?.description).toBeNull();
  });

  it('returns null for an unknown id', async () => {
    expect(await store.update('nope', { name: 'x' })).toBeNull();
  });
});

describe('InMemoryBoardStore.remove', () => {
  it('returns true and removes an existing board', async () => {
    const created = await store.create({ name: 'A' });
    expect(await store.remove(created.id)).toBe(true);
    expect(await store.get(created.id)).toBeNull();
  });

  it('returns false for an unknown id', async () => {
    expect(await store.remove('nope')).toBe(false);
  });
});
