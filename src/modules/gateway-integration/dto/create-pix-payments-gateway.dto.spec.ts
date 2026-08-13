import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PixGatewayPaymentsDto } from './create-pix-payments-gateway.dto';

function validateDto(payload: Record<string, unknown>) {
  return validate(plainToInstance(PixGatewayPaymentsDto, payload));
}

function omit<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  const clone = { ...obj };
  delete clone[key];
  return clone;
}

describe('PixGatewayPaymentsDto', () => {
  const valid = { amount: 1000, payerDocument: '12345678901' };

  it('accepts a valid Pix charge', async () => {
    expect(await validateDto(valid)).toHaveLength(0);
  });

  it('rejects a missing amount', async () => {
    const errors = await validateDto(omit(valid, 'amount'));
    expect(errors.some((e) => e.property === 'amount')).toBe(true);
  });

  it('rejects an amount of zero or less', async () => {
    const errors = await validateDto({ ...valid, amount: -10 });
    expect(errors.some((e) => e.property === 'amount')).toBe(true);
  });

  it('rejects a missing payerDocument', async () => {
    const errors = await validateDto(omit(valid, 'payerDocument'));
    expect(errors.some((e) => e.property === 'payerDocument')).toBe(true);
  });
});
