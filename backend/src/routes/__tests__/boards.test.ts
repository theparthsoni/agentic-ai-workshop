import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { InMemoryBoardStore } from '../../boards/boardStore.js';
import type { BoardStore } from '../../boards/boardStore.js';

// Each test gets a fresh in-memory store injected into the app, so the HTTP
// layer is exercised end-to-end without a live database (mirrors how /health
// injects checkDb).
function appWith(store: BoardStore) {
  return createApp({ boardStore: store });
}

let store: InMemoryBoardStore;

beforeEach(() => {
  store = new InMemoryBoardStore();
});

describe('GET /boards', () => {
  it('returns 200 with an empty array when there are no boards', async () => {
    const res = await request(appWith(store)).get('/boards');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all boards, newest first', async () => {
    const first = await store.create({ name: 'First' });
    const second = await store.create({ name: 'Second' });
    const res = await request(appWith(store)).get('/boards');
    expect(res.status).toBe(200);
    expect(res.body.map((b: { id: string }) => b.id)).toEqual([second.id, first.id]);
  });
});

describe('POST /boards', () => {
  it('creates a board and returns 201 with the persisted resource', async () => {
    const res = await request(appWith(store))
      .post('/boards')
      .send({ name: 'Roadmap', description: 'Q3 planning' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Roadmap', description: 'Q3 planning' });
    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.createdAt).toEqual(expect.any(String));
    expect(res.body.updatedAt).toEqual(expect.any(String));
    // Actually persisted.
    expect(await store.get(res.body.id)).not.toBeNull();
  });

  it('defaults description to null when omitted', async () => {
    const res = await request(appWith(store)).post('/boards').send({ name: 'No desc' });
    expect(res.status).toBe(201);
    expect(res.body.description).toBeNull();
  });

  it('trims whitespace from the name', async () => {
    const res = await request(appWith(store)).post('/boards').send({ name: '  Padded  ' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Padded');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(appWith(store)).post('/boards').send({ description: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name is required/i);
  });

  it('returns 400 when name is an empty/whitespace string', async () => {
    const res = await request(appWith(store)).post('/boards').send({ name: '   ' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when name is not a string', async () => {
    const res = await request(appWith(store)).post('/boards').send({ name: 42 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when description is the wrong type', async () => {
    const res = await request(appWith(store))
      .post('/boards')
      .send({ name: 'ok', description: 123 });
    expect(res.status).toBe(400);
  });
});

describe('GET /boards/:id', () => {
  it('returns 200 with the board when it exists', async () => {
    const created = await store.create({ name: 'Find me' });
    const res = await request(appWith(store)).get(`/boards/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(created);
  });

  it('returns 404 when the board does not exist', async () => {
    const res = await request(appWith(store)).get('/boards/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});

describe('PATCH /boards/:id', () => {
  it('updates the name and returns 200 with the updated board', async () => {
    const created = await store.create({ name: 'Old', description: 'keep' });
    const res = await request(appWith(store))
      .patch(`/boards/${created.id}`)
      .send({ name: 'New' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New');
    expect(res.body.description).toBe('keep'); // untouched
  });

  it('can set description to null', async () => {
    const created = await store.create({ name: 'B', description: 'had one' });
    const res = await request(appWith(store))
      .patch(`/boards/${created.id}`)
      .send({ description: null });
    expect(res.status).toBe(200);
    expect(res.body.description).toBeNull();
    expect(res.body.name).toBe('B'); // untouched
  });

  it('returns 404 when the board does not exist', async () => {
    const res = await request(appWith(store)).patch('/boards/missing').send({ name: 'x' });
    expect(res.status).toBe(404);
  });

  it('returns 400 when no updatable fields are provided', async () => {
    const created = await store.create({ name: 'B' });
    const res = await request(appWith(store)).patch(`/boards/${created.id}`).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no updatable fields/i);
  });

  it('returns 400 when name is invalid', async () => {
    const created = await store.create({ name: 'B' });
    const res = await request(appWith(store))
      .patch(`/boards/${created.id}`)
      .send({ name: '' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /boards/:id', () => {
  it('deletes the board and returns 204', async () => {
    const created = await store.create({ name: 'Doomed' });
    const res = await request(appWith(store)).delete(`/boards/${created.id}`);
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(await store.get(created.id)).toBeNull();
  });

  it('returns 404 when the board does not exist', async () => {
    const res = await request(appWith(store)).delete('/boards/missing');
    expect(res.status).toBe(404);
  });
});

describe('/boards — store failure handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 500 (not a crash) when the store throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const brokenStore = {
      list: () => Promise.reject(new Error('db down')),
    } as unknown as BoardStore;
    const res = await request(appWith(brokenStore)).get('/boards');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/failed to list/i);
  });
});
