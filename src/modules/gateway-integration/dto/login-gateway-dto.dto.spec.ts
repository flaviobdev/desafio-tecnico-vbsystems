import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginGatewayDto } from './login-gateway-dto.dto';

function validateDto(payload: Record<string, unknown>) {
  return validate(plainToInstance(LoginGatewayDto, payload));
}

describe('LoginGatewayDto', () => {
  it('accepts a valid login request', async () => {
    const errors = await validateDto({
      document: '12345678901',
      password: 'secret',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing document', async () => {
    const errors = await validateDto({ password: 'secret' });
    expect(errors.some((e) => e.property === 'document')).toBe(true);
  });

  it('rejects a missing password', async () => {
    const errors = await validateDto({ document: '12345678901' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects an empty-string password', async () => {
    const errors = await validateDto({ document: '12345678901', password: '' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});
