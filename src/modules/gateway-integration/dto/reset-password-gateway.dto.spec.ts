import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ResetPasswordGatewayDto } from './reset-password-gateway.dto';

function validateDto(payload: Record<string, unknown>) {
  return validate(plainToInstance(ResetPasswordGatewayDto, payload));
}

function omit<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  const clone = { ...obj };
  delete clone[key];
  return clone;
}

describe('ResetPasswordGatewayDto', () => {
  const valid = { document: '12345678901', email: 'fulano@example.com' };

  it('accepts a valid reset-password request', async () => {
    expect(await validateDto(valid)).toHaveLength(0);
  });

  it('rejects a missing document', async () => {
    const errors = await validateDto(omit(valid, 'document'));
    expect(errors.some((e) => e.property === 'document')).toBe(true);
  });

  it('rejects a missing email', async () => {
    const errors = await validateDto(omit(valid, 'email'));
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('rejects a malformed e-mail', async () => {
    const errors = await validateDto({ ...valid, email: 'nao-e-um-email' });
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });
});
