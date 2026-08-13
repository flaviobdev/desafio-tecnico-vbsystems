import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WithdrawalsService } from './withdrawals.service';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import { Withdrawal } from './entities/withdrawal.entity';

describe('WithdrawalsService', () => {
  let service: WithdrawalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalsService,
        {
          provide: LeraBoxService,
          useValue: {
            createWithdrawal: jest.fn(),
            getWithdrawalById: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(GatewayAccount),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Withdrawal),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WithdrawalsService>(WithdrawalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
