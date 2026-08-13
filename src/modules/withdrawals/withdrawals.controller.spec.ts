import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('WithdrawalsController', () => {
  let controller: WithdrawalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WithdrawalsController],
      providers: [
        {
          provide: WithdrawalsService,
          useValue: {
            createWithdrawal: jest.fn(),
            getWithdrawalById: jest.fn(),
          },
        },
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
});
