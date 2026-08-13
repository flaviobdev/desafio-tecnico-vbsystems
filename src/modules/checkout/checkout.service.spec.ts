import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CheckoutService } from './checkout.service';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import { Order, OrderStatus } from './entities/order.entity';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let leraBox: {
    createPixPayment: jest.Mock;
    createCardPayment: jest.Mock;
    getFees: jest.Mock;
    getPaymentById: jest.Mock;
  };
  let gatewayAccountsRepository: { findOne: jest.Mock };
  let ordersRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    leraBox = {
      createPixPayment: jest.fn(),
      createCardPayment: jest.fn(),
      getFees: jest.fn(),
      getPaymentById: jest.fn(),
    };
    gatewayAccountsRepository = { findOne: jest.fn() };
    ordersRepository = { create: jest.fn(), save: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: LeraBoxService, useValue: leraBox },
        { provide: getRepositoryToken(GatewayAccount), useValue: gatewayAccountsRepository },
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCardPayment', () => {
    it('rejects a feePercent that does not match the current fee table, without calling the gateway', async () => {
      gatewayAccountsRepository.findOne.mockResolvedValue({ id: 'acc-1', token: 'token' });
      leraBox.getFees.mockResolvedValue({
        total: 1,
        fees: [{ id: 'f1', brand: 'VISA', installments: 3, feePercent: 4.5, feePercentFormatted: '4.5%' }],
      });

      await expect(
        service.createCardPayment('acc-1', {
          amount: 1000,
          cardNumber: '4111111111111111',
          cardHolder: 'Fulano',
          expiryMonth: '12',
          expiryYear: '2030',
          cvv: '123',
          installments: 3,
          feePercent: 99,
        } as never),
      ).rejects.toThrow(BadRequestException);

      expect(leraBox.createCardPayment).not.toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('expires a still-PENDING Pix order locally once past expiresAt, without polling the gateway', async () => {
      gatewayAccountsRepository.findOne.mockResolvedValue({ id: 'acc-1', token: 'token' });
      const order = {
        id: 'order-1',
        status: OrderStatus.PENDING,
        expiresAt: new Date(Date.now() - 1000),
        gatewayTransactionId: 'gw-1',
      };
      ordersRepository.findOne.mockResolvedValue(order);
      ordersRepository.save.mockImplementation((o) => Promise.resolve(o));

      const result = await service.getOrderById('acc-1', 'order-1');

      expect(result.status).toBe(OrderStatus.EXPIRED);
      expect(leraBox.getPaymentById).not.toHaveBeenCalled();
    });
  });

  describe('cancelOrder', () => {
    it('cancels a PENDING order', async () => {
      const order = { id: 'order-1', status: OrderStatus.PENDING };
      ordersRepository.findOne.mockResolvedValue(order);
      ordersRepository.save.mockImplementation((o) => Promise.resolve(o));

      const result = await service.cancelOrder('acc-1', 'order-1');

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('refuses to cancel an order that already resolved', async () => {
      ordersRepository.findOne.mockResolvedValue({ id: 'order-1', status: OrderStatus.APPROVED });

      await expect(service.cancelOrder('acc-1', 'order-1')).rejects.toThrow(ConflictException);
      expect(ordersRepository.save).not.toHaveBeenCalled();
    });
  });
});
