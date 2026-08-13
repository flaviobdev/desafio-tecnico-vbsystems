import { CorrelationIdMiddleware, RequestWithCorrelationId } from './correlation-id.middleware';

describe('CorrelationIdMiddleware', () => {
  function mockRes() {
    const listeners: Record<string, () => void> = {};
    return {
      setHeader: jest.fn(),
      statusCode: 200,
      on: jest.fn((event: string, cb: () => void) => {
        listeners[event] = cb;
      }),
      emitFinish: () => listeners.finish?.(),
    };
  }

  it('generates a correlation id and echoes it on the response when none is sent', () => {
    const middleware = new CorrelationIdMiddleware();
    const req = { headers: {}, method: 'GET', originalUrl: '/api/wallet' } as unknown as RequestWithCorrelationId;
    const res = mockRes();
    const next = jest.fn();

    middleware.use(req, res as never, next);

    expect(req.correlationId).toEqual(expect.any(String));
    expect(req.correlationId.length).toBeGreaterThan(0);
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-Id', req.correlationId);
    expect(next).toHaveBeenCalled();
  });

  it('reuses an incoming X-Correlation-Id instead of generating a new one', () => {
    const middleware = new CorrelationIdMiddleware();
    const req = {
      headers: { 'x-correlation-id': 'trace-123' },
      method: 'GET',
      originalUrl: '/api/wallet',
    } as unknown as RequestWithCorrelationId;
    const res = mockRes();

    middleware.use(req, res as never, jest.fn());

    expect(req.correlationId).toBe('trace-123');
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-Id', 'trace-123');
  });
});
