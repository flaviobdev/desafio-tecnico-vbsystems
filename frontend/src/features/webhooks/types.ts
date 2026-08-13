export type WebhookEvent = 'PAYMENT_PIX' | 'PAYMENT_CARD' | 'WITHDRAWAL';

export type Webhook = {
  id: string;
  event: WebhookEvent;
  url: string;
  active: boolean;
};

export type CreateWebhookPayload = {
  event: WebhookEvent;
  url: string;
  secret?: string;
};
