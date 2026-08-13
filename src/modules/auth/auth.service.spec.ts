import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let leraBox: { loginUser: jest.Mock };
  let jwtService: { signAsync: jest.Mock };
  let gatewayAccountsRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let usersRepository: { findOne: jest.Mock };

  beforeEach(async () => {
    leraBox = { loginUser: jest.fn() };
    jwtService = { signAsync: jest.fn() };
    gatewayAccountsRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    usersRepository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: LeraBoxService, useValue: leraBox },
        { provide: JwtService, useValue: jwtService },
        {
          provide: getRepositoryToken(GatewayAccount),
          useValue: gatewayAccountsRepository,
        },
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a new gateway_account on first login and signs a JWT scoped to it', async () => {
    leraBox.loginUser.mockResolvedValue({
      access_token: 'gateway-secret-token',
      codigoCliente: 4321,
      chaveLoja: 'loja-01',
    });
    gatewayAccountsRepository.findOne.mockResolvedValue(null);
    const newAccount = { id: 'acc-1', document: '12345678901' };
    gatewayAccountsRepository.create.mockReturnValue(newAccount);
    gatewayAccountsRepository.save.mockImplementation((acc) =>
      Promise.resolve(acc),
    );
    usersRepository.findOne.mockResolvedValue(null);
    jwtService.signAsync.mockResolvedValue('local-jwt');

    const result = await service.login({
      document: '12345678901',
      password: 'secret',
    });

    expect(gatewayAccountsRepository.create).toHaveBeenCalledWith({
      document: '12345678901',
    });
    expect(newAccount).toMatchObject({
      token: 'gateway-secret-token',
      codigoCliente: '4321',
      chaveLoja: 'loja-01',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'acc-1',
      document: '12345678901',
    });
    expect(result).toEqual({
      accessToken: 'local-jwt',
      user: { name: '12345678901', document: '12345678901' },
    });
  });

  it('reuses an existing gateway_account instead of creating a duplicate', async () => {
    leraBox.loginUser.mockResolvedValue({
      access_token: 'tok',
      codigoCliente: 1,
      chaveLoja: 'loja',
    });
    const existingAccount = { id: 'acc-existing', document: '98765432100' };
    gatewayAccountsRepository.findOne.mockResolvedValue(existingAccount);
    gatewayAccountsRepository.save.mockImplementation((acc) =>
      Promise.resolve(acc),
    );
    usersRepository.findOne.mockResolvedValue({ name: 'Loja da Maria' });
    jwtService.signAsync.mockResolvedValue('local-jwt');

    const result = await service.login({
      document: '98765432100',
      password: 'secret',
    });

    expect(gatewayAccountsRepository.create).not.toHaveBeenCalled();
    expect(result.user).toEqual({
      name: 'Loja da Maria',
      document: '98765432100',
    });
  });

  it('never leaks the gateway token or password in the response', async () => {
    leraBox.loginUser.mockResolvedValue({
      access_token: 'super-secret',
      codigoCliente: 1,
      chaveLoja: 'loja',
    });
    gatewayAccountsRepository.findOne.mockResolvedValue({
      id: 'acc-1',
      document: 'doc',
    });
    gatewayAccountsRepository.save.mockImplementation((acc) =>
      Promise.resolve(acc),
    );
    usersRepository.findOne.mockResolvedValue(null);
    jwtService.signAsync.mockResolvedValue('local-jwt');

    const result = await service.login({ document: 'doc', password: 'secret' });

    expect(JSON.stringify(result)).not.toContain('super-secret');
    expect(JSON.stringify(result)).not.toContain('secret');
  });
});
