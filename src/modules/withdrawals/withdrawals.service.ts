import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import { CreateWithdrawGatewayDto } from '../gateway-integration/dto/create-withdraw-gateway.dto';
import { Withdrawal, WithdrawalStatus } from './entities/withdrawal.entity';
import { PAGE_SIZE } from '../../common/dto/pagination-query.dto';
import { paginate } from '../../common/dto/paginated.interface';

@Injectable()
export class WithdrawalsService {
  constructor(
    private readonly leraBox: LeraBoxService,
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountsRepository: Repository<GatewayAccount>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalsRepository: Repository<Withdrawal>,
  ) {}

  async createWithdrawal(
    gatewayAccountId: string,
    data: CreateWithdrawGatewayDto,
  ) {
    const gatewayAccount = await this.gatewayAccountsRepository.findOne({
      where: { id: gatewayAccountId },
    });

    if (!gatewayAccount) {
      throw new NotFoundException('Conta do gateway não encontrada');
    }

    const gatewayResponse = await this.leraBox.createWithdrawal(
      gatewayAccount.token,
      data,
    );

    const withdrawal = this.withdrawalsRepository.create({
      gatewayAccount,
      amount: data.amount,
      pixKey: data.pixKey,
      document: data.document,
      description: data.description ?? null,
      externalReference: data.externalReference ?? null,
      status: gatewayResponse.status as WithdrawalStatus,
      denialReason: gatewayResponse.denialReason,
      gatewayTransactionId: gatewayResponse.id,
      gatewayResponse,
    });

    const saved = await this.withdrawalsRepository.save(withdrawal);

    return this.toResponse(saved);
  }

  async listWithdrawals(gatewayAccountId: string, page = 1) {
    const [withdrawals, total] = await this.withdrawalsRepository.findAndCount({
      where: { gatewayAccount: { id: gatewayAccountId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    return paginate(
      withdrawals.map((withdrawal) => this.toResponse(withdrawal)),
      total,
      page,
      PAGE_SIZE,
    );
  }

  async getWithdrawalById(gatewayAccountId: string, withdrawalId: string) {
    const gatewayAccount = await this.gatewayAccountsRepository.findOne({
      where: { id: gatewayAccountId },
    });

    if (!gatewayAccount) {
      throw new NotFoundException('Conta do gateway não encontrada');
    }

    const withdrawal = await this.withdrawalsRepository.findOne({
      where: { id: withdrawalId, gatewayAccount: { id: gatewayAccountId } },
    });

    if (!withdrawal) {
      throw new NotFoundException('Saque não encontrado');
    }

    // Mesma regra do checkout: o status definitivo vem do webhook. Só reconsultamos o
    // gateway aqui enquanto ainda está PENDING (fallback pra quando não há webhook
    // configurado), nunca sobrescrevendo um status já resolvido.
    if (
      withdrawal.gatewayTransactionId &&
      withdrawal.status === WithdrawalStatus.PENDING
    ) {
      const gatewayResponse = await this.leraBox.getWithdrawalById(
        gatewayAccount.token,
        withdrawal.gatewayTransactionId,
      );

      withdrawal.status = gatewayResponse.status as WithdrawalStatus;
      withdrawal.denialReason = gatewayResponse.denialReason;
      withdrawal.gatewayResponse = gatewayResponse;
      await this.withdrawalsRepository.save(withdrawal);
    }

    return this.toResponse(withdrawal);
  }

  private toResponse(withdrawal: Withdrawal) {
    return {
      id: withdrawal.id,
      amount: withdrawal.amount,
      pixKey: withdrawal.pixKey,
      document: withdrawal.document,
      description: withdrawal.description,
      externalReference: withdrawal.externalReference,
      status: withdrawal.status,
      denialReason: withdrawal.denialReason,
      gatewayTransactionId: withdrawal.gatewayTransactionId,
      createdAt: withdrawal.createdAt,
    };
  }
}
