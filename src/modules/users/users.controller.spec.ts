import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PersonType } from '../gateway-integration/dto/create-gateway-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: { create: jest.Mock };

  beforeEach(async () => {
    usersService = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates signup to the service with the submitted dto', async () => {
    const dto = {
      personType: PersonType.PF,
      name: 'Fulano',
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
    usersService.create.mockResolvedValue({ id: 'user-1', ...dto });

    const result = await controller.create(dto);

    expect(usersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 'user-1', ...dto });
  });
});
