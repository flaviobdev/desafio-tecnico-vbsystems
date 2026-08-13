import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../../common/guards/jwt-auth.guard';

describe('WithdrawalsController', () => {
  let controller: WithdrawalsController;
  let withdrawalsService: {
    createWithdrawal: jest.Mock;
    listWithdrawals: jest.Mock;
    getWithdrawalById: jest.Mock;
  };

  beforeEach(async () => {
    withdrawalsService = {
      createWithdrawal: jest.fn(),
      listWithdrawals: jest.fn(),
      getWithdrawalById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WithdrawalsController],
      providers: [
        { provide: WithdrawalsService, useValue: withdrawalsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WithdrawalsController>(WithdrawalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('scopes withdrawal creation to the authenticated gateway account', async () => {
    const req = { gatewayAccountId: 'acc-1' } as AuthenticatedRequest;
    const dto = {
      amount: 5000,
      pixKey: 'chave@pix.com',
      document: '12345678901',
    };
    withdrawalsService.createWithdrawal.mockResolvedValue({
      id: 'w-1',
      ...dto,
    });

    await controller.createWithdrawal(req, dto);

    expect(withdrawalsService.createWithdrawal).toHaveBeenCalledWith(
      'acc-1',
      dto,
    );
  });

  it('forwards the requested page when listing withdrawals', async () => {
    const req = { gatewayAccountId: 'acc-1' } as AuthenticatedRequest;
    withdrawalsService.listWithdrawals.mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      pageSize: 10,
      totalPages: 1,
    });

    await controller.listWithdrawals(req, { page: 2 });

    expect(withdrawalsService.listWithdrawals).toHaveBeenCalledWith('acc-1', 2);
  });

  it('scopes a single withdrawal lookup to the authenticated gateway account', async () => {
    const req = { gatewayAccountId: 'acc-1' } as AuthenticatedRequest;
    withdrawalsService.getWithdrawalById.mockResolvedValue({
      id: 'w-1',
      status: 'PENDING',
    });

    await controller.getWithdrawalById(req, 'w-1');

    expect(withdrawalsService.getWithdrawalById).toHaveBeenCalledWith(
      'acc-1',
      'w-1',
    );
  });
});
