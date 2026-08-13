import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WebhooksService } from './webhooks.service';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import { WebhookEvent } from '../gateway-integration/dto/create-webhook-gateway.dto';
import { Order } from '../checkout/entities/order.entity';
import { Withdrawal } from '../withdrawals/entities/withdrawal.entity';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhookEventLog } from './entities/webhook-event-log.entity';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let leraBox: {
    upsertWebhook: jest.Mock;
    listWebhooks: jest.Mock;
    removeWebhook: jest.Mock;
  };
  let gatewayAccountsRepository: { findOne: jest.Mock };
  let subscriptionsRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let eventsRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let ordersRepository: { findOne: jest.Mock; save: jest.Mock };
  let withdrawalsRepository: { findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    leraBox = {
      upsertWebhook: jest.fn(),
      listWebhooks: jest.fn(),
      removeWebhook: jest.fn(),
    };
    gatewayAccountsRepository = { findOne: jest.fn() };
    subscriptionsRepository = {
      findOne: jest.fn(),
      create: jest.fn((data: object) => data),
      save: jest.fn((data: object) => data),
      delete: jest.fn(),
    };
    eventsRepository = {
      findOne: jest.fn(),
      create: jest.fn((data: object) => data),
      save: jest.fn((data: object) => data),
    };
    ordersRepository = {
      findOne: jest.fn(),
      save: jest.fn((data: object) => data),
    };
    withdrawalsRepository = {
      findOne: jest.fn(),
      save: jest.fn((data: object) => data),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: LeraBoxService, useValue: leraBox },
        {
          provide: getRepositoryToken(GatewayAccount),
          useValue: gatewayAccountsRepository,
        },
        {
          provide: getRepositoryToken(WebhookSubscription),
          useValue: subscriptionsRepository,
        },
        {
          provide: getRepositoryToken(WebhookEventLog),
          useValue: eventsRepository,
        },
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
        {
          provide: getRepositoryToken(Withdrawal),
          useValue: withdrawalsRepository,
        },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertWebhook', () => {
    it('upserts the webhook with the stored token, persists the secret locally and never exposes it back', async () => {
      gatewayAccountsRepository.findOne.mockResolvedValue({
        id: 'acc-1',
        token: 'secret-token',
      });
      subscriptionsRepository.findOne.mockResolvedValue(null);
      leraBox.upsertWebhook.mockResolvedValue({
        id: 'hook-1',
        event: WebhookEvent.PAYMENT_PIX,
        url: 'https://seu-sistema.com/webhooks/lera-box/pix',
        active: true,
        createdAt: '2026-08-12T03:17:55.773Z',
      });

      const result = await service.upsertWebhook('acc-1', {
        event: WebhookEvent.PAYMENT_PIX,
        url: 'https://seu-sistema.com/webhooks/lera-box/pix',
        secret: 'segredo',
      });

      expect(leraBox.upsertWebhook).toHaveBeenCalledWith('secret-token', {
        event: WebhookEvent.PAYMENT_PIX,
        url: 'https://seu-sistema.com/webhooks/lera-box/pix',
        secret: 'segredo',
      });
      expect(subscriptionsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          gatewayWebhookId: 'hook-1',
          secret: 'segredo',
        }),
      );
      expect(result).toEqual({
        id: 'hook-1',
        event: WebhookEvent.PAYMENT_PIX,
        url: 'https://seu-sistema.com/webhooks/lera-box/pix',
        active: true,
        createdAt: '2026-08-12T03:17:55.773Z',
      });
      expect(result).not.toHaveProperty('secret');
    });

    it('throws NotFoundException when the account has no linked gateway account', async () => {
      gatewayAccountsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.upsertWebhook('unknown', {
          event: WebhookEvent.WITHDRAWAL,
          url: 'https://seu-sistema.com/webhooks/lera-box/saque',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('handleCallback', () => {
    const gatewayTransactionId = 'gw-txn-1';
    const payload = {
      id: gatewayTransactionId,
      status: 'APPROVED',
      denialReason: null,
    };
    const body = Buffer.from(JSON.stringify(payload));
    const secret = 'minha-chave-secreta';
    const validSignature = createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    it('applies the status to the order and records the event when the signature is valid', async () => {
      ordersRepository.findOne.mockResolvedValue({
        id: 'order-1',
        status: 'PENDING',
        gatewayAccount: { id: 'acc-1' },
      });
      subscriptionsRepository.findOne.mockResolvedValue({ secret });
      eventsRepository.findOne.mockResolvedValue(null);

      await service.handleCallback(
        WebhookEvent.PAYMENT_PIX,
        body,
        validSignature,
        payload,
      );

      expect(ordersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'APPROVED' }),
      );
      expect(eventsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          signatureValid: true,
          processedAt: expect.any(Date),
        }),
      );
    });

    it('matches the order by txid even when the payload also carries a different internal transactionId', async () => {
      // Payload real observado do Lera Box: "transactionId" é um id interno do gateway
      // que não bate com o que guardamos; "txid" é o que corresponde ao nosso registro.
      const realPayload = {
        status: 'APPROVED',
        denialReason: null,
        transactionId: 'internal-uuid-diferente-do-txid',
        txid: 'LB8F9EB845B85CC25E8DBB',
      };
      const realBody = Buffer.from(JSON.stringify(realPayload));

      ordersRepository.findOne.mockResolvedValue({
        id: 'order-1',
        status: 'PENDING',
        gatewayTransactionId: 'LB8F9EB845B85CC25E8DBB',
        gatewayAccount: { id: 'acc-1' },
      });
      subscriptionsRepository.findOne.mockResolvedValue(null);
      eventsRepository.findOne.mockResolvedValue(null);

      await service.handleCallback(
        WebhookEvent.PAYMENT_PIX,
        realBody,
        undefined,
        realPayload,
      );

      expect(ordersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'APPROVED' }),
      );
      expect(eventsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          gatewayTransactionId: 'LB8F9EB845B85CC25E8DBB',
        }),
      );
    });

    it('rejects and logs the attempt when the signature does not match the configured secret', async () => {
      ordersRepository.findOne.mockResolvedValue({
        id: 'order-1',
        status: 'PENDING',
        gatewayAccount: { id: 'acc-1' },
      });
      subscriptionsRepository.findOne.mockResolvedValue({ secret });

      await expect(
        service.handleCallback(
          WebhookEvent.PAYMENT_PIX,
          body,
          'assinatura-forjada',
          payload,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(ordersRepository.save).not.toHaveBeenCalled();
      expect(eventsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ signatureValid: false }),
      );
    });

    it('is idempotent: replaying an already-processed (transaction, status) pair is a no-op', async () => {
      ordersRepository.findOne.mockResolvedValue({
        id: 'order-1',
        status: 'APPROVED',
        gatewayAccount: { id: 'acc-1' },
      });
      subscriptionsRepository.findOne.mockResolvedValue({ secret });
      eventsRepository.findOne.mockResolvedValue({
        id: 'evt-1',
        signatureValid: true,
      });

      await service.handleCallback(
        WebhookEvent.PAYMENT_PIX,
        body,
        validSignature,
        payload,
      );

      expect(ordersRepository.save).not.toHaveBeenCalled();
    });

    it('skips signature validation when no secret was configured for the event', async () => {
      withdrawalsRepository.findOne.mockResolvedValue({
        id: 'wd-1',
        status: 'PENDING',
        gatewayAccount: { id: 'acc-1' },
      });
      subscriptionsRepository.findOne.mockResolvedValue(null);
      eventsRepository.findOne.mockResolvedValue(null);

      await service.handleCallback(
        WebhookEvent.WITHDRAWAL,
        body,
        undefined,
        payload,
      );

      expect(withdrawalsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'APPROVED' }),
      );
    });
  });
});
