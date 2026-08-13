import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock; resetPassword: jest.Mock };

  beforeEach(async () => {
    authService = { login: jest.fn(), resetPassword: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates login to the service with the submitted dto', async () => {
    const dto = { document: '12345678901', password: 'secret' };
    authService.login.mockResolvedValue({
      accessToken: 'jwt',
      user: { name: 'Fulano', document: dto.document },
    });

    const result = await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      accessToken: 'jwt',
      user: { name: 'Fulano', document: dto.document },
    });
  });

  it('delegates reset-password to the service with the submitted dto', async () => {
    const dto = { document: '12345678901', email: 'fulano@example.com' };
    authService.resetPassword.mockResolvedValue({
      success: true,
      statusCode: 201,
    });

    const result = await controller.resetPassword(dto);

    expect(authService.resetPassword).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ success: true, statusCode: 201 });
  });
});
