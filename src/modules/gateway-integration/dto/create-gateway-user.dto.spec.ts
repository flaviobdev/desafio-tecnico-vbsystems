import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateGatewayUserDto, PersonType } from './create-gateway-user.dto';

function validateDto(payload: Record<string, unknown>) {
  return validate(plainToInstance(CreateGatewayUserDto, payload));
}

function omit<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  const clone = { ...obj };
  delete clone[key];
  return clone;
}

describe('CreateGatewayUserDto', () => {
  const valid = {
    personType: PersonType.PF,
    name: 'Fulano da Silva',
    email: 'fulano@example.com',
    phone: '11999999999',
    document: '12345678901',
    zipCode: '01001000',
    address: 'Rua Teste',
    number: '100',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
  };

  it('accepts a valid PF signup', async () => {
    expect(await validateDto(valid)).toHaveLength(0);
  });

  it('rejects an invalid personType', async () => {
    const errors = await validateDto({ ...valid, personType: 'EMPRESA' });
    expect(errors.some((e) => e.property === 'personType')).toBe(true);
  });

  it('rejects a malformed e-mail', async () => {
    const errors = await validateDto({ ...valid, email: 'nao-e-um-email' });
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('rejects a missing document', async () => {
    const errors = await validateDto(omit(valid, 'document'));
    expect(errors.some((e) => e.property === 'document')).toBe(true);
  });

  it('reports every missing required field at once, not just the first', async () => {
    const errors = await validateDto({ personType: PersonType.PJ });
    const missing = errors.map((e) => e.property);
    expect(missing).toEqual(
      expect.arrayContaining([
        'name',
        'email',
        'phone',
        'document',
        'zipCode',
        'address',
        'number',
        'neighborhood',
        'city',
        'state',
      ]),
    );
  });
});
