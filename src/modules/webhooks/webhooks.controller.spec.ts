import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../../common/guards/jwt-auth.guard';
import { WebhookEvent } from '../gateway-integration/dto/create-webhook-gateway.dto';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let webhooksService: {
    upsertWebhook: jest.Mock;
    listWebhooks: jest.Mock;
    removeWebhook: jest.Mock;
  };

  beforeEach(async () => {
    webhooksService = {
      upsertWebhook: jest.fn(),
      listWebhooks: jest.fn(),
      removeWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [{ provide: WebhooksService, useValue: webhooksService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates webhook upsert to the service for the authenticated gateway account', async () => {
    webhooksService.upsertWebhook.mockResolvedValue({ id: 'hook-1' });
    const req = { gatewayAccountId: 'acc-1' } as AuthenticatedRequest;
    const dto = {
      event: WebhookEvent.PAYMENT_PIX,
      url: 'https://seu-sistema.com/webhooks/lera-box/pix',
    };

    const result = await controller.upsertWebhook(req, dto);

    expect(webhooksService.upsertWebhook).toHaveBeenCalledWith('acc-1', dto);
    expect(result).toEqual({ id: 'hook-1' });
  });
});
