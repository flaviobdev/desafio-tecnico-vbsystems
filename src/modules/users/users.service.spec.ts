import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { PersonType } from '../gateway-integration/dto/create-gateway-user.dto';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let leraBox: { createUser: jest.Mock };
  let usersRepository: { create: jest.Mock; save: jest.Mock };

  const signupData = {
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

  beforeEach(async () => {
    leraBox = { createUser: jest.fn() };
    usersRepository = { create: jest.fn(), save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: LeraBoxService, useValue: leraBox },
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers the user on the gateway before mirroring it locally', async () => {
    leraBox.createUser.mockResolvedValue({ success: true, statusCode: 201 });
    const createdEntity = { ...signupData, id: 'user-1' };
    usersRepository.create.mockReturnValue(createdEntity);
    usersRepository.save.mockResolvedValue(createdEntity);

    const result = await service.create(signupData);

    expect(leraBox.createUser).toHaveBeenCalledWith(signupData);
    expect(usersRepository.create).toHaveBeenCalledWith(signupData);
    expect(usersRepository.save).toHaveBeenCalledWith(createdEntity);
    expect(result).toBe(createdEntity);
  });

  it('does not persist a local user when the gateway signup fails', async () => {
    leraBox.createUser.mockRejectedValue(
      new Error('e-mail já cadastrado no gateway'),
    );

    await expect(service.create(signupData)).rejects.toThrow(
      'e-mail já cadastrado no gateway',
    );
    expect(usersRepository.create).not.toHaveBeenCalled();
    expect(usersRepository.save).not.toHaveBeenCalled();
  });
});
