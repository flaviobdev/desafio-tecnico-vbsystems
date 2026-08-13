import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard, AuthenticatedRequest } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: { verifyAsync: jest.Mock };

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    guard = new JwtAuthGuard(jwtService as unknown as JwtService);
  });

  function contextWithHeader(authorization?: string): ExecutionContext {
    const request = { headers: { authorization } } as AuthenticatedRequest;
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  it('rejects a request with no Authorization header', async () => {
    await expect(
      guard.canActivate(contextWithHeader(undefined)),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects a header that is not in the "Bearer <token>" format', async () => {
    await expect(
      guard.canActivate(contextWithHeader('Basic abc123')),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      guard.canActivate(contextWithHeader('Bearer')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects an invalid or expired token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(
      guard.canActivate(contextWithHeader('Bearer bad-token')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('allows the request through and attaches gatewayAccountId when the token is valid', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'acc-1',
      document: '12345678901',
    });
    const request = {
      headers: { authorization: 'Bearer good-token' },
    } as AuthenticatedRequest;
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(request.gatewayAccountId).toBe('acc-1');
  });
});
