import { TransactionStatus } from '../../components/StatusStamp';

export type Withdrawal = {
  id: string;
  amountCents: number;
  pixKey: string;
  status: TransactionStatus;
  requestedAt: string;
};

export type CreateWithdrawalPayload = {
  amountCents: number;
  pixKey: string;
};
