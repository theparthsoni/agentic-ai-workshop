import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';

// Happy path (AC-HAPPY-1): DB reachable → 200 {status:"ok",db:"connected"}.
// Inject a passing DB check so the test is deterministic without a live DB.
const okDbCheck = () => Promise.resolve();

// Degraded path (AC-ERROR-1): DB unreachable → injected failing check.
const failingDbCheck = () => Promise.reject(new Error('connection refused'));

describe('GET /health — happy path', () => {
  it('returns HTTP 200', async () => {
    const app = createApp({ checkDb: okDbCheck });
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('responds with application/json', async () => {
    const app = createApp({ checkDb: okDbCheck });
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('returns body {status:"ok",db:"connected"}', async () => {
    const app = createApp({ checkDb: okDbCheck });
    const res = await request(app).get('/health');
    expect(res.body).toEqual({ status: 'ok', db: 'connected' });
  });

  it('responds in under 100ms locally', async () => {
    const app = createApp({ checkDb: okDbCheck });
    const start = performance.now();
    await request(app).get('/health');
    expect(performance.now() - start).toBeLessThan(100);
  });
});

describe('GET /health — degraded path (DB unreachable)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns HTTP 200 (process stays alive, not 500)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = createApp({ checkDb: failingDbCheck });
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('returns body {status:"degraded",db:"unreachable"}', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = createApp({ checkDb: failingDbCheck });
    const res = await request(app).get('/health');
    expect(res.body).toEqual({ status: 'degraded', db: 'unreachable' });
  });

  it('logs the DB failure server-side', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = createApp({ checkDb: failingDbCheck });
    await request(app).get('/health');
    expect(errorSpy).toHaveBeenCalled();
  });
});
