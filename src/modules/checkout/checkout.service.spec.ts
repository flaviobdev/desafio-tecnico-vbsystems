import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CheckoutService } from './checkout.service';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import { Order } from './entities/order.entity';

describe('CheckoutService', () => {
  let service: CheckoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: LeraBoxService,
          useValue: {
            createPixPayment: jest.fn(),
            createCardPayment: jest.fn(),
            getFees: jest.fn(),
            getPaymentById: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(GatewayAccount),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
