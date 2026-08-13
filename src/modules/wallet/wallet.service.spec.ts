import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import { Order } from '../checkout/entities/order.entity';

describe('WalletService', () => {
  let service: WalletService;
  let leraBox: { getWallet: jest.Mock; getTransactions: jest.Mock };
  let gatewayAccountsRepository: { findOne: jest.Mock };
  let ordersRepository: { find: jest.Mock };

  beforeEach(async () => {
    leraBox = { getWallet: jest.fn(), getTransactions: jest.fn() };
    gatewayAccountsRepository = { findOne: jest.fn() };
    ordersRepository = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: LeraBoxService, useValue: leraBox },
        {
          provide: getRepositoryToken(GatewayAccount),
          useValue: gatewayAccountsRepository,
        },
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('fetches the gateway wallet with the stored token and maps balance to cents, never exposing the token', async () => {
    gatewayAccountsRepository.findOne.mockResolvedValue({
      id: 'acc-1',
      token: 'secret-token',
    });
    leraBox.getWallet.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      balance: 1050,
      balanceFormatted: 'R$ 10,50',
      updatedAt: '2026-08-12T03:17:55.773Z',
    });

    const result = await service.getBalance('acc-1');

    expect(leraBox.getWallet).toHaveBeenCalledWith('secret-token');
    expect(result).toEqual({
      balanceCents: 1050,
      updatedAt: '2026-08-12T03:17:55.773Z',
    });
    expect(result).not.toHaveProperty('token');
  });

  it('throws NotFoundException when the account has no linked gateway account', async () => {
    gatewayAccountsRepository.findOne.mockResolvedValue(null);

    await expect(service.getBalance('unknown')).rejects.toThrow(NotFoundException);
  });

  describe('getTransactions', () => {
    it('attaches the local order id to payment rows so the frontend can link to the receipt', async () => {
      gatewayAccountsRepository.findOne.mockResolvedValue({ id: 'acc-1', token: 'secret-token' });
      leraBox.getTransactions.mockResolvedValue({
        transactions: [
          {
            id: 'gw-pix-1',
            type: 'PIX',
            status: 'APPROVED',
            amount: 1000,
            description: 'Pagamento Pix',
            createdAt: '2026-08-12T03:17:55.773Z',
          },
          {
            id: 'gw-withdrawal-1',
            type: 'WITHDRAWAL',
            status: 'APPROVED',
            amount: 500,
            description: 'Saque',
            createdAt: '2026-08-12T03:17:55.773Z',
          },
        ],
      });
      ordersRepository.find.mockResolvedValue([
        { id: 'order-local-1', walletTransactionId: 'gw-pix-1', gatewayTransactionId: 'LB-pix-1' },
      ]);

      const result = await service.getTransactions('acc-1', {});

      expect(ordersRepository.find).toHaveBeenCalledWith({
        where: [{ walletTransactionId: expect.anything() }, { gatewayTransactionId: expect.anything() }],
      });
      expect(result.data).toEqual([
        expect.objectContaining({ id: 'gw-pix-1', orderId: 'order-local-1' }),
        expect.objectContaining({ id: 'gw-withdrawal-1', orderId: null }),
      ]);
    });
  });
});
