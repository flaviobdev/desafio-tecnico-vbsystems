import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WithdrawalsService } from './withdrawals.service';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import { Withdrawal, WithdrawalStatus } from './entities/withdrawal.entity';

describe('WithdrawalsService', () => {
  let service: WithdrawalsService;
  let leraBox: { createWithdrawal: jest.Mock; getWithdrawalById: jest.Mock };
  let gatewayAccountsRepository: { findOne: jest.Mock };
  let withdrawalsRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    findAndCount: jest.Mock;
  };

  beforeEach(async () => {
    leraBox = { createWithdrawal: jest.fn(), getWithdrawalById: jest.fn() };
    gatewayAccountsRepository = { findOne: jest.fn() };
    withdrawalsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalsService,
        { provide: LeraBoxService, useValue: leraBox },
        {
          provide: getRepositoryToken(GatewayAccount),
          useValue: gatewayAccountsRepository,
        },
        {
          provide: getRepositoryToken(Withdrawal),
          useValue: withdrawalsRepository,
        },
      ],
    }).compile();

    service = module.get<WithdrawalsService>(WithdrawalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWithdrawal', () => {
    it('debits the wallet on the gateway before persisting the local withdrawal', async () => {
      const gatewayAccount = { id: 'acc-1', token: 'secret-token' };
      gatewayAccountsRepository.findOne.mockResolvedValue(gatewayAccount);
      leraBox.createWithdrawal.mockResolvedValue({
        id: 'gw-withdrawal-1',
        status: 'APPROVED',
        denialReason: null,
      });
      withdrawalsRepository.create.mockImplementation((data: unknown) => data);
      withdrawalsRepository.save.mockImplementation((w) => Promise.resolve(w));

      const data = {
        amount: 5000,
        pixKey: 'chave@pix.com',
        document: '12345678901',
      };
      const result = await service.createWithdrawal('acc-1', data);

      expect(leraBox.createWithdrawal).toHaveBeenCalledWith(
        'secret-token',
        data,
      );
      expect(result.status).toBe('APPROVED');
      expect(result.gatewayTransactionId).toBe('gw-withdrawal-1');
    });

    it('throws NotFoundException instead of calling the gateway when there is no linked account', async () => {
      gatewayAccountsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createWithdrawal('acc-unknown', {
          amount: 1000,
          pixKey: 'k',
          document: 'd',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(leraBox.createWithdrawal).not.toHaveBeenCalled();
    });
  });

  describe('listWithdrawals', () => {
    it('paginates using the requested page and the account scope', async () => {
      withdrawalsRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.listWithdrawals('acc-1', 2);

      expect(withdrawalsRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { gatewayAccount: { id: 'acc-1' } },
          skip: 10,
          take: 10,
        }),
      );
    });

    it('returns a Paginated envelope with the total count', async () => {
      const rows = [{ id: 'w-1', status: WithdrawalStatus.APPROVED }];
      withdrawalsRepository.findAndCount.mockResolvedValue([rows, 1]);

      const result = await service.listWithdrawals('acc-1');

      expect(result).toEqual(
        expect.objectContaining({
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        }),
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getWithdrawalById', () => {
    it('throws NotFoundException when the withdrawal does not belong to the account', async () => {
      gatewayAccountsRepository.findOne.mockResolvedValue({
        id: 'acc-1',
        token: 't',
      });
      withdrawalsRepository.findOne.mockResolvedValue(null);

      await expect(service.getWithdrawalById('acc-1', 'w-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('re-polls the gateway while the withdrawal is still PENDING', async () => {
      gatewayAccountsRepository.findOne.mockResolvedValue({
        id: 'acc-1',
        token: 'secret-token',
      });
      const withdrawal = {
        id: 'w-1',
        status: WithdrawalStatus.PENDING,
        gatewayTransactionId: 'gw-1',
      };
      withdrawalsRepository.findOne.mockResolvedValue(withdrawal);
      withdrawalsRepository.save.mockImplementation((w) => Promise.resolve(w));
      leraBox.getWithdrawalById.mockResolvedValue({
        status: 'DENIED',
        denialReason: 'INSUFFICIENT_BALANCE',
      });

      const result = await service.getWithdrawalById('acc-1', 'w-1');

      expect(leraBox.getWithdrawalById).toHaveBeenCalledWith(
        'secret-token',
        'gw-1',
      );
      expect(result.status).toBe('DENIED');
      expect(result.denialReason).toBe('INSUFFICIENT_BALANCE');
    });

    it('does not re-poll the gateway once the withdrawal is already resolved', async () => {
      gatewayAccountsRepository.findOne.mockResolvedValue({
        id: 'acc-1',
        token: 'secret-token',
      });
      const withdrawal = {
        id: 'w-1',
        status: WithdrawalStatus.APPROVED,
        gatewayTransactionId: 'gw-1',
      };
      withdrawalsRepository.findOne.mockResolvedValue(withdrawal);

      const result = await service.getWithdrawalById('acc-1', 'w-1');

      expect(leraBox.getWithdrawalById).not.toHaveBeenCalled();
      expect(result.status).toBe(WithdrawalStatus.APPROVED);
    });
  });
});
