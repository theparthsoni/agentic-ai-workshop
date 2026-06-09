import { describe, it, expect, vi, beforeEach } from 'vitest';

// Regression guard for AC-ERROR-1: a pg Pool emits an async 'error' event when
// an idle client's connection drops (Postgres stopped/restarted). Without a
// pool-level 'error' listener, Node crashes the process. defaultDbCheck() must
// attach one. We mock `pg` so no live database is required.

const onMock = vi.fn();
const queryMock = vi.fn().mockResolvedValue({ rows: [] });

vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(function MockPool() {
    return { on: onMock, query: queryMock };
  }),
}));

describe('defaultDbCheck — pool error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("attaches an 'error' listener to the pool so a dropped DB connection cannot crash the process", async () => {
    // Fresh import so the module-level pool is recreated under the mock.
    const { defaultDbCheck } = await import('../health.js');
    await defaultDbCheck();

    expect(onMock).toHaveBeenCalledWith('error', expect.any(Function));

    // The attached handler must swallow (not rethrow) the error.
    const handler = onMock.mock.calls.find((c) => c[0] === 'error')?.[1];
    expect(handler).toBeTypeOf('function');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => handler(new Error('terminating connection'))).not.toThrow();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
