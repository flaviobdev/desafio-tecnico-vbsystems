import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import { PixGatewayPaymentsDto } from '../gateway-integration/dto/create-pix-payments-gateway.dto';
import { CardGatewayPaymentsDto } from '../gateway-integration/dto/create-card-payments-gateway.dto';
import { Order, OrderMethod, OrderStatus } from './entities/order.entity';

const PIX_EXPIRY_MINUTES = 30;

@Injectable()
export class CheckoutService {
  constructor(
    private readonly leraBox: LeraBoxService,
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountsRepository: Repository<GatewayAccount>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async createPixPayment(
    gatewayAccountId: string,
    data: PixGatewayPaymentsDto,
  ) {
    const gatewayAccount = await this.gatewayAccountsRepository.findOne({
      where: { id: gatewayAccountId },
    });

    if (!gatewayAccount) {
      throw new NotFoundException('Conta do gateway não encontrada');
    }

    const gatewayResponse = await this.leraBox.createPixPayment(
      gatewayAccount.token,
      data,
    );

    const order = this.ordersRepository.create({
      gatewayAccount,
      method: OrderMethod.PIX,
      amount: data.amount,
      payerDocument: data.payerDocument,
      description: data.description ?? null,
      externalReference: data.externalReference ?? null,
      gatewayTransactionId: gatewayResponse.txid,
      walletTransactionId: gatewayResponse.id,
      emv: gatewayResponse.emv,
      expiresAt: new Date(Date.now() + PIX_EXPIRY_MINUTES * 60_000),
      gatewayResponse,
    });

    const saved = await this.ordersRepository.save(order);

    return this.toResponse(saved);
  }

  async getFees(brand?: string) {
    return this.leraBox.getFees(brand);
  }

  async createCardPayment(
    gatewayAccountId: string,
    data: CardGatewayPaymentsDto,
  ) {
    const gatewayAccount = await this.gatewayAccountsRepository.findOne({
      where: { id: gatewayAccountId },
    });

    if (!gatewayAccount) {
      throw new NotFoundException('Conta do gateway não encontrada');
    }

    const { fees } = await this.leraBox.getFees();
    const isKnownFee = fees.some(
      (fee) =>
        fee.installments === data.installments &&
        fee.feePercent === data.feePercent,
    );
    if (!isKnownFee) {
      throw new BadRequestException(
        'A taxa informada não corresponde à tabela de taxas vigente.',
      );
    }

    const gatewayResponse = await this.leraBox.createCardPayment(
      gatewayAccount.token,
      data,
    );

    const order = this.ordersRepository.create({
      gatewayAccount,
      method: OrderMethod.CREDIT_CARD,
      amount: data.amount,
      status: gatewayResponse.status as OrderStatus,
      denialReason: gatewayResponse.denialReason,
      description: data.description ?? null,
      externalReference: data.externalReference ?? null,
      gatewayTransactionId: gatewayResponse.id,
      installments: gatewayResponse.metadata.installments,
      feePercent: gatewayResponse.metadata.feePercent,
      cardBrand: gatewayResponse.metadata.cardBrand,
      cardLast4: gatewayResponse.metadata.cardLast4,
      netAmountCents: gatewayResponse.metadata.netAmountCents,
      gatewayResponse,
    });

    const saved = await this.ordersRepository.save(order);

    return this.toResponse(saved);
  }

  async getOrderById(gatewayAccountId: string, orderId: string) {
    const gatewayAccount = await this.gatewayAccountsRepository.findOne({
      where: { id: gatewayAccountId },
    });

    if (!gatewayAccount) {
      throw new NotFoundException('Conta do gateway não encontrada');
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId, gatewayAccount: { id: gatewayAccountId } },
    });

    if (!order) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (
      order.status === OrderStatus.PENDING &&
      order.expiresAt &&
      order.expiresAt.getTime() < Date.now()
    ) {
      order.status = OrderStatus.EXPIRED;
      await this.ordersRepository.save(order);
      return this.toResponse(order);
    }

    // O status definitivo deve vir do webhook (ver WebhooksService.handleCallback).
    // Só reconsultamos o gateway aqui enquanto ainda está PENDING, como um fallback
    // pra quando o webhook não está configurado/não chegou — nunca sobrescrevemos um
    // status que já foi resolvido (por webhook ou por uma consulta anterior).
    if (order.gatewayTransactionId && order.status === OrderStatus.PENDING) {
      const gatewayResponse = await this.leraBox.getPaymentById(
        gatewayAccount.token,
        order.gatewayTransactionId,
      );

      order.status = gatewayResponse.status as OrderStatus;
      order.denialReason = gatewayResponse.denialReason;
      order.gatewayResponse = gatewayResponse;
      await this.ordersRepository.save(order);
    }

    return this.toResponse(order);
  }

  async cancelOrder(gatewayAccountId: string, orderId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, gatewayAccount: { id: gatewayAccountId } },
    });

    if (!order) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ConflictException(
        'Só é possível cancelar cobranças ainda pendentes.',
      );
    }

    order.status = OrderStatus.CANCELLED;
    const saved = await this.ordersRepository.save(order);

    return this.toResponse(saved);
  }

  private toResponse(order: Order) {
    return {
      id: order.id,
      method: order.method,
      amount: order.amount,
      status: order.status,
      denialReason: order.denialReason,
      payerDocument: order.payerDocument,
      description: order.description,
      externalReference: order.externalReference,
      gatewayTransactionId: order.gatewayTransactionId,
      emv: order.emv,
      installments: order.installments,
      feePercent: order.feePercent,
      cardBrand: order.cardBrand,
      cardLast4: order.cardLast4,
      netAmountCents: order.netAmountCents,
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
    };
  }
}
