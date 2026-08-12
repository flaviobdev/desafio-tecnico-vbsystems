import { IsIn, IsOptional, IsString } from 'class-validator';

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
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsIn(Object.values(TransactionStatus))
  status?: TransactionStatus;

  @IsOptional()
  @IsIn(Object.values(TransactionType))
  type?: TransactionType;
}
