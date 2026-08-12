import { TransactionStatus } from '../../components/StatusStamp';

export type Balance = {
  balanceCents: number;
};

export type TransactionType = 'PIX' | 'CARD' | 'WITHDRAWAL';

export type Transaction = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amountCents: number;
  description: string;
  createdAt: string;
};

export type TransactionFilters = {
  status: TransactionStatus | 'ALL';
  type: TransactionType | 'ALL';
};
