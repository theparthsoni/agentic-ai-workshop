import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('createApp (Phase 1 scaffold smoke test)', () => {
  it('returns a defined, callable Express application', () => {
    const app = createApp();
    expect(app).toBeDefined();
    // Express apps are callable request handlers (functions).
    expect(typeof app).toBe('function');
  });

  it('responds with HTTP 404 for an unknown route', async () => {
    const app = createApp();
    const response = await request(app).get('/__does_not_exist__');
    expect(response.status).toBe(404);
  });
});
