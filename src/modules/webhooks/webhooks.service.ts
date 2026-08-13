import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  LeraBoxService,
  GatewayWebhook,
} from '../gateway-integration/lera-box.service';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import {
  CreateWebhookGatewayDto,
  WebhookEvent,
} from '../gateway-integration/dto/create-webhook-gateway.dto';
import { Order, OrderStatus } from '../checkout/entities/order.entity';
import {
  Withdrawal,
  WithdrawalStatus,
} from '../withdrawals/entities/withdrawal.entity';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhookEventLog } from './entities/webhook-event-log.entity';
import { isValidWebhookSignature } from '../../common/webhooks/webhook-signature.util';
import { PAGE_SIZE } from '../../common/dto/pagination-query.dto';
import { paginate } from '../../common/dto/paginated.interface';

type LeraBoxWebhookPayload = Record<string, unknown>;

// A Lera Box manda mais de um identificador no payload do webhook (ex.: `txid` e um
// `transactionId` interno diferente). `txid`/`id` são os que batem com o que guardamos
// como gatewayTransactionId na criação do pedido; testamos todos os candidatos possíveis
// em vez de confiar num único nome de campo.
function extractTransactionIdCandidates(
  payload: LeraBoxWebhookPayload,
): string[] {
  const metadata =
    typeof payload.metadata === 'object' && payload.metadata !== null
      ? (payload.metadata as Record<string, unknown>)
      : {};
  const candidates = [
    payload.txid,
    payload.id,
    payload.paymentId,
    payload.withdrawalId,
    metadata.txid,
    metadata.id,
    payload.transactionId,
  ];
  return candidates.filter((c): c is string => typeof c === 'string');
}

function extractStatus(payload: LeraBoxWebhookPayload): string | undefined {
  return typeof payload.status === 'string' ? payload.status : undefined;
}

function extractDenialReason(payload: LeraBoxWebhookPayload): string | null {
  return typeof payload.denialReason === 'string' ? payload.denialReason : null;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly leraBox: LeraBoxService,
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountsRepository: Repository<GatewayAccount>,
    @InjectRepository(WebhookSubscription)
    private readonly subscriptionsRepository: Repository<WebhookSubscription>,
    @InjectRepository(WebhookEventLog)
    private readonly eventsRepository: Repository<WebhookEventLog>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalsRepository: Repository<Withdrawal>,
  ) {}

  async upsertWebhook(gatewayAccountId: string, data: CreateWebhookGatewayDto) {
    const account = await this.getAccountOrFail(gatewayAccountId);
    const webhook = await this.leraBox.upsertWebhook(account.token, data);

    let subscription = await this.subscriptionsRepository.findOne({
      where: { gatewayAccount: { id: gatewayAccountId }, event: data.event },
    });
    if (!subscription) {
      subscription = this.subscriptionsRepository.create({
        gatewayAccount: account,
        event: data.event,
      });
    }
    subscription.gatewayWebhookId = webhook.id;
    subscription.secret = data.secret ?? null;
    await this.subscriptionsRepository.save(subscription);

    return this.toResponse(webhook);
  }

  async listWebhooks(gatewayAccountId: string, page = 1) {
    const account = await this.getAccountOrFail(gatewayAccountId);
    const webhooks = await this.leraBox.listWebhooks(account.token);
    const mapped = webhooks.map((webhook) => this.toResponse(webhook));
    const start = (page - 1) * PAGE_SIZE;

    return paginate(
      mapped.slice(start, start + PAGE_SIZE),
      mapped.length,
      page,
      PAGE_SIZE,
    );
  }

  async removeWebhook(gatewayAccountId: string, id: string): Promise<void> {
    const account = await this.getAccountOrFail(gatewayAccountId);
    await this.leraBox.removeWebhook(account.token, id);
    await this.subscriptionsRepository.delete({
      gatewayAccount: { id: gatewayAccountId },
      gatewayWebhookId: id,
    });
  }

  async handleCallback(
    event: WebhookEvent,
    rawBody: Buffer,
    signatureHeader: string | undefined,
    payload: LeraBoxWebhookPayload,
  ): Promise<void> {
    const candidateIds = extractTransactionIdCandidates(payload);
    const status = extractStatus(payload);
    if (candidateIds.length === 0 || !status) {
      throw new BadRequestException(
        'Payload de webhook inválido: faltam id e/ou status da transação.',
      );
    }

    const record =
      event === WebhookEvent.WITHDRAWAL
        ? await this.withdrawalsRepository.findOne({
            where: { gatewayTransactionId: In(candidateIds) },
            relations: { gatewayAccount: true },
          })
        : await this.ordersRepository.findOne({
            where: { gatewayTransactionId: In(candidateIds) },
            relations: { gatewayAccount: true },
          });

    if (!record) {
      this.logger.warn(
        `Webhook ${event} para transação não reconhecida: ${JSON.stringify(payload)}`,
      );
      await this.eventsRepository.save(
        this.eventsRepository.create({
          event,
          gatewayAccountId: null,
          gatewayTransactionId: candidateIds[0],
          status,
          payload,
          signatureValid: false,
          processedAt: null,
        }),
      );
      throw new NotFoundException(
        'Transação referenciada pelo webhook não foi encontrada.',
      );
    }

    const gatewayTransactionId = record.gatewayTransactionId!;
    const gatewayAccountId = record.gatewayAccount.id;
    const subscription = await this.subscriptionsRepository.findOne({
      where: { gatewayAccount: { id: gatewayAccountId }, event },
    });

    const signatureValid = subscription?.secret
      ? isValidWebhookSignature(rawBody, subscription.secret, signatureHeader)
      : true;

    const denialReason = extractDenialReason(payload);
    const eventLog = this.eventsRepository.create({
      event,
      gatewayAccountId,
      gatewayTransactionId,
      status,
      payload,
      signatureValid,
      processedAt: null,
    });

    if (subscription?.secret && !signatureValid) {
      await this.eventsRepository.save(eventLog);
      throw new UnauthorizedException('Assinatura do webhook inválida.');
    }

    // Um pagamento/saque só resolve uma vez: depois que o status sai de PENDING, ignoramos
    // qualquer outro webhook pra essa transação (reenvio duplicado ou uma segunda notificação
    // divergente), em vez de deixar o último a chegar sobrescrever o que já foi decidido.
    const isAlreadyResolved =
      event === WebhookEvent.WITHDRAWAL
        ? (record as Withdrawal).status !== WithdrawalStatus.PENDING
        : (record as Order).status !== OrderStatus.PENDING;
    if (isAlreadyResolved) {
      return;
    }

    if (event === WebhookEvent.WITHDRAWAL) {
      const withdrawal = record as Withdrawal;
      withdrawal.status = status as WithdrawalStatus;
      withdrawal.denialReason = denialReason;
      await this.withdrawalsRepository.save(withdrawal);
    } else {
      const order = record as Order;
      order.status = status as OrderStatus;
      order.denialReason = denialReason;
      await this.ordersRepository.save(order);
    }

    eventLog.processedAt = new Date();
    await this.eventsRepository.save(eventLog);
  }

  private async getAccountOrFail(
    gatewayAccountId: string,
  ): Promise<GatewayAccount> {
    const account = await this.gatewayAccountsRepository.findOne({
      where: { id: gatewayAccountId },
    });
    if (!account) {
      throw new NotFoundException('Conta do gateway não encontrada.');
    }

    return account;
  }

  private toResponse(webhook: GatewayWebhook) {
    return {
      id: webhook.id,
      event: webhook.event,
      url: webhook.url,
      active: webhook.active,
      createdAt: webhook.createdAt,
    };
  }
}
