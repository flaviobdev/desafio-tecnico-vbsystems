import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import { WalletBalanceDto } from './dto/wallet-balance.dto';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly leraBox: LeraBoxService,
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountsRepository: Repository<GatewayAccount>,
  ) {}

  async getBalance(gatewayAccountId: string): Promise<WalletBalanceDto> {
    const account = await this.getAccountOrFail(gatewayAccountId);
    const wallet = await this.leraBox.getWallet(account.token);

    return { balanceCents: wallet.balance, updatedAt: wallet.updatedAt };
  }

  async getTransactions(gatewayAccountId: string, query: GetTransactionsQueryDto) {
    const account = await this.getAccountOrFail(gatewayAccountId);
    const response = await this.leraBox.getTransactions(account.token, query);

    return response.transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      status: tx.status,
      amountCents: tx.amount,
      description: tx.description,
      createdAt: tx.createdAt,
    }));
  }

  private async getAccountOrFail(gatewayAccountId: string): Promise<GatewayAccount> {
    const account = await this.gatewayAccountsRepository.findOne({ where: { id: gatewayAccountId } });
    if (!account) {
      throw new NotFoundException('Conta do gateway não encontrada.');
    }

    return account;
  }
}
