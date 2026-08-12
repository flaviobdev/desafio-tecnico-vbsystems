export type PaymentMethod = 'PIX' | 'CARD';

export type Fee = {
  installments: number;
  feePercent: number;
};

export type CreateCheckoutPayload = {
  amountCents: number;
  method: PaymentMethod;
  installments?: number;
};

export type PixCheckoutResult = {
  method: 'PIX';
  qrCodeBase64: string;
  emvCode: string;
  expiresAt: string;
};

export type CardCheckoutResult = {
  method: 'CARD';
  checkoutUrl: string;
  feePercent: number;
};

export type CheckoutResult = PixCheckoutResult | CardCheckoutResult;
