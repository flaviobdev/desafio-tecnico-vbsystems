import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../../common/guards/jwt-auth.guard';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: { getBalance: jest.Mock };

  beforeEach(async () => {
    walletService = { getBalance: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: walletService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WalletController>(WalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('resolves the balance for the authenticated gateway account', async () => {
    walletService.getBalance.mockResolvedValue({
      balanceCents: 1050,
      updatedAt: '2026-08-12T03:17:55.773Z',
    });
    const req = { gatewayAccountId: 'acc-1' } as AuthenticatedRequest;

    const result = await controller.getBalance(req);

    expect(walletService.getBalance).toHaveBeenCalledWith('acc-1');
    expect(result).toEqual({
      balanceCents: 1050,
      updatedAt: '2026-08-12T03:17:55.773Z',
    });
  });
});
