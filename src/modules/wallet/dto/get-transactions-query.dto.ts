import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum TransactionType {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  WITHDRAWAL = 'WITHDRAWAL',
}

export class GetTransactionsQueryDto {
  @ApiPropertyOptional({
    enum: TransactionStatus,
    description: 'Filtra o extrato por status',
  })
  @IsOptional()
  @IsIn(Object.values(TransactionStatus))
  status?: TransactionStatus;

  @ApiPropertyOptional({
    enum: TransactionType,
    description: 'Filtra o extrato por tipo de transação',
  })
  @IsOptional()
  @IsIn(Object.values(TransactionType))
  type?: TransactionType;

  @ApiPropertyOptional({
    description: 'Página do extrato (10 itens por página)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
