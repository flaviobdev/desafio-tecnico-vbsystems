import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateWithdrawGatewayDto } from './create-withdraw-gateway.dto';

function validateDto(payload: Record<string, unknown>) {
  return validate(plainToInstance(CreateWithdrawGatewayDto, payload));
}

function omit<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  const clone = { ...obj };
  delete clone[key];
  return clone;
}

describe('CreateWithdrawGatewayDto', () => {
  const valid = {
    amount: 5000,
    pixKey: 'chave@pix.com',
    document: '12345678901',
  };

  it('accepts a valid withdrawal request without the optional fields', async () => {
    expect(await validateDto(valid)).toHaveLength(0);
  });

  it('accepts a valid withdrawal request with description and externalReference', async () => {
    const errors = await validateDto({
      ...valid,
      description: 'Saque mensal',
      externalReference: 'REF-1',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing amount', async () => {
    const errors = await validateDto(omit(valid, 'amount'));
    expect(errors.some((e) => e.property === 'amount')).toBe(true);
  });

  it('rejects an amount of zero or less', async () => {
    const errors = await validateDto({ ...valid, amount: 0 });
    expect(errors.some((e) => e.property === 'amount')).toBe(true);
  });

  it('rejects an amount sent as a non-numeric string', async () => {
    const errors = await validateDto({ ...valid, amount: 'cem reais' });
    expect(errors.some((e) => e.property === 'amount')).toBe(true);
  });

  it('rejects a missing pixKey', async () => {
    const errors = await validateDto(omit(valid, 'pixKey'));
    expect(errors.some((e) => e.property === 'pixKey')).toBe(true);
  });

  it('rejects a missing document', async () => {
    const errors = await validateDto(omit(valid, 'document'));
    expect(errors.some((e) => e.property === 'document')).toBe(true);
  });
});
