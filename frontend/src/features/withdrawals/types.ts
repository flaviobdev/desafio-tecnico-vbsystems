export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'DENIED';

export type Withdrawal = {
  id: string;
  amount: number;
  pixKey: string;
  document: string;
  description: string | null;
  externalReference: string | null;
  status: WithdrawalStatus;
  denialReason: string | null;
  gatewayTransactionId: string | null;
  createdAt: string;
};

export type CreateWithdrawalPayload = {
  amount: number;
  pixKey: string;
  document: string;
  description?: string;
  externalReference?: string;
};
