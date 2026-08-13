export type OrderStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED' | 'CANCELLED';

export type Fee = {
  id: string;
  brand: string;
  installments: number;
  feePercent: number;
  feePercentFormatted: string;
};

export type CreatePixChargePayload = {
  amount: number;
  payerDocument: string;
  description?: string;
  externalReference?: string;
};

export type CreateCardChargePayload = {
  amount: number;
  description?: string;
  externalReference?: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  installments: number;
  feePercent: number;
};

export type PixCharge = {
  id: string;
  method: 'PIX';
  amount: number;
  status: OrderStatus;
  payerDocument: string | null;
  description: string | null;
  externalReference: string | null;
  gatewayTransactionId: string | null;
  emv: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type CardCharge = {
  id: string;
  method: 'CREDIT_CARD';
  amount: number;
  status: OrderStatus;
  description: string | null;
  externalReference: string | null;
  gatewayTransactionId: string | null;
  installments: number | null;
  feePercent: number | null;
  cardBrand: string | null;
  cardLast4: string | null;
  netAmountCents: number | null;
  expiresAt: string | null;
  createdAt: string;
};

export type Charge = PixCharge | CardCharge;
