import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';

// Happy path (AC-HAPPY-1): DB reachable → 200 {status:"ok",db:"connected"}.
// Inject a passing DB check so the test is deterministic without a live DB.
const okDbCheck = () => Promise.resolve();

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
