import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CardGatewayPaymentsDto } from './create-card-payments-gateway.dto';

function validateDto(payload: Record<string, unknown>) {
  return validate(plainToInstance(CardGatewayPaymentsDto, payload));
}

function omit<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  const clone = { ...obj };
  delete clone[key];
  return clone;
}

describe('CardGatewayPaymentsDto', () => {
  const valid = {
    amount: 1000,
    cardNumber: '4111111111111111',
    cardHolder: 'Fulano da Silva',
    expiryMonth: '12',
    expiryYear: '2030',
    cvv: '123',
    installments: 3,
    feePercent: 4.5,
  };

  it('accepts a valid card charge', async () => {
    expect(await validateDto(valid)).toHaveLength(0);
  });

  it('rejects a missing card number', async () => {
    const errors = await validateDto(omit(valid, 'cardNumber'));
    expect(errors.some((e) => e.property === 'cardNumber')).toBe(true);
  });

  it('rejects installments outside the 1-21 range', async () => {
    const tooLow = await validateDto({ ...valid, installments: 0 });
    const tooHigh = await validateDto({ ...valid, installments: 22 });
    expect(tooLow.some((e) => e.property === 'installments')).toBe(true);
    expect(tooHigh.some((e) => e.property === 'installments')).toBe(true);
  });

  it('rejects installments sent as a decimal number', async () => {
    const errors = await validateDto({ ...valid, installments: 2.5 });
    expect(errors.some((e) => e.property === 'installments')).toBe(true);
  });

  it('rejects a negative feePercent', async () => {
    const errors = await validateDto({ ...valid, feePercent: -1 });
    expect(errors.some((e) => e.property === 'feePercent')).toBe(true);
  });

  it('rejects a missing cvv', async () => {
    const errors = await validateDto(omit(valid, 'cvv'));
    expect(errors.some((e) => e.property === 'cvv')).toBe(true);
  });
});
