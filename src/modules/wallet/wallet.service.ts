import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import { Order } from '../checkout/entities/order.entity';
import { WalletBalanceDto } from './dto/wallet-balance.dto';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';
import { PAGE_SIZE } from '../../common/dto/pagination-query.dto';
import { paginate } from '../../common/dto/paginated.interface';

// A Lera Box não suporta offset/page no extrato, só um `limit`. Buscamos um lote
// grande o bastante para cobrir o extrato inteiro e paginamos aqui no backend.
const GATEWAY_FETCH_LIMIT = '1000';

@Injectable()
export class WalletService {
  constructor(
    private readonly leraBox: LeraBoxService,
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountsRepository: Repository<GatewayAccount>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async getBalance(gatewayAccountId: string): Promise<WalletBalanceDto> {
    const account = await this.getAccountOrFail(gatewayAccountId);
    const wallet = await this.leraBox.getWallet(account.token);

    return { balanceCents: wallet.balance, updatedAt: wallet.updatedAt };
  }

  async getTransactions(gatewayAccountId: string, query: GetTransactionsQueryDto) {
    const account = await this.getAccountOrFail(gatewayAccountId);
    const response = await this.leraBox.getTransactions(account.token, {
      status: query.status,
      type: query.type,
      limit: GATEWAY_FETCH_LIMIT,
    });

    const transactions = response.transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      status: tx.status,
      amountCents: tx.amount,
      description: tx.description,
      createdAt: tx.createdAt,
    }));

    const page = query.page ?? 1;
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = transactions.slice(start, start + PAGE_SIZE);

    // O comprovante imprimível vive em /checkout/:id, identificado pelo id local do
    // pedido. O extrato da carteira usa o `id` interno da Lera Box, que pro Pix é
    // diferente do `txid` que guardamos como gatewayTransactionId (por isso também
    // cruzamos por walletTransactionId) — pro cartão os dois valores já coincidem.
    const paymentTxIds = pageItems.filter((tx) => tx.type !== 'WITHDRAWAL').map((tx) => tx.id);
    const orders = paymentTxIds.length
      ? await this.ordersRepository.find({
          where: [{ walletTransactionId: In(paymentTxIds) }, { gatewayTransactionId: In(paymentTxIds) }],
        })
      : [];
    const orderIdByTxId = new Map<string, string>();
    for (const order of orders) {
      if (order.walletTransactionId) orderIdByTxId.set(order.walletTransactionId, order.id);
      if (order.gatewayTransactionId) orderIdByTxId.set(order.gatewayTransactionId, order.id);
    }

    const data = pageItems.map((tx) => ({
      ...tx,
      orderId: orderIdByTxId.get(tx.id) ?? null,
    }));

    return paginate(data, transactions.length, page, PAGE_SIZE);
  }

  private async getAccountOrFail(gatewayAccountId: string): Promise<GatewayAccount> {
    const account = await this.gatewayAccountsRepository.findOne({ where: { id: gatewayAccountId } });
    if (!account) {
      throw new NotFoundException('Conta do gateway não encontrada.');
    }

    return account;
  }
}
