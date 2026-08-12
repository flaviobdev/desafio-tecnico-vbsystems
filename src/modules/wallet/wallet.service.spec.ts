import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';

describe('WalletService', () => {
  let service: WalletService;
  let leraBox: { getWallet: jest.Mock };
  let gatewayAccountsRepository: { findOne: jest.Mock };

  beforeEach(async () => {
    leraBox = { getWallet: jest.fn() };
    gatewayAccountsRepository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: LeraBoxService, useValue: leraBox },
        { provide: getRepositoryToken(GatewayAccount), useValue: gatewayAccountsRepository },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('fetches the gateway wallet with the stored token and maps balance to cents, never exposing the token', async () => {
    gatewayAccountsRepository.findOne.mockResolvedValue({ id: 'acc-1', token: 'secret-token' });
    leraBox.getWallet.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      balance: 1050,
      balanceFormatted: 'R$ 10,50',
      updatedAt: '2026-08-12T03:17:55.773Z',
    });

    const result = await service.getBalance('acc-1');

    expect(leraBox.getWallet).toHaveBeenCalledWith('secret-token');
    expect(result).toEqual({ balanceCents: 1050, updatedAt: '2026-08-12T03:17:55.773Z' });
    expect(result).not.toHaveProperty('token');
  });

  it('throws NotFoundException when the account has no linked gateway account', async () => {
    gatewayAccountsRepository.findOne.mockResolvedValue(null);

    await expect(service.getBalance('unknown')).rejects.toThrow(NotFoundException);
  });
});
