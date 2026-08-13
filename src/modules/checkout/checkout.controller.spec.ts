import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../../common/guards/jwt-auth.guard';

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let checkoutService: {
    createPixPayment: jest.Mock;
    createCardPayment: jest.Mock;
    getFees: jest.Mock;
    getOrderById: jest.Mock;
    cancelOrder: jest.Mock;
  };

  beforeEach(async () => {
    checkoutService = {
      createPixPayment: jest.fn(),
      createCardPayment: jest.fn(),
      getFees: jest.fn(),
      getOrderById: jest.fn(),
      cancelOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [{ provide: CheckoutService, useValue: checkoutService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CheckoutController>(CheckoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('scopes Pix payment creation to the authenticated gateway account', async () => {
    const req = { gatewayAccountId: 'acc-1' } as AuthenticatedRequest;
    const dto = { amount: 1000, payerDocument: '12345678901' };
    checkoutService.createPixPayment.mockResolvedValue({
      id: 'order-1',
      ...dto,
    });

    await controller.createPixPayment(req, dto as never);

    expect(checkoutService.createPixPayment).toHaveBeenCalledWith('acc-1', dto);
  });

  it('scopes order lookup to the authenticated gateway account', async () => {
    const req = { gatewayAccountId: 'acc-1' } as AuthenticatedRequest;
    checkoutService.getOrderById.mockResolvedValue({
      id: 'order-1',
      status: 'PENDING',
    });

    await controller.getOrderById(req, 'order-1');

    expect(checkoutService.getOrderById).toHaveBeenCalledWith(
      'acc-1',
      'order-1',
    );
  });

  it('scopes order cancellation to the authenticated gateway account', async () => {
    const req = { gatewayAccountId: 'acc-1' } as AuthenticatedRequest;
    checkoutService.cancelOrder.mockResolvedValue({
      id: 'order-1',
      status: 'CANCELLED',
    });

    await controller.cancelOrder(req, 'order-1');

    expect(checkoutService.cancelOrder).toHaveBeenCalledWith(
      'acc-1',
      'order-1',
    );
  });
});
