import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum WebhookEvent {
  PAYMENT_PIX = 'PAYMENT_PIX',
  PAYMENT_CARD = 'PAYMENT_CARD',
  WITHDRAWAL = 'WITHDRAWAL',
}

export class CreateWebhookGatewayDto {
  @IsEnum(WebhookEvent)
  @IsNotEmpty()
  event!: WebhookEvent;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsString()
  @IsOptional()
  secret?: string;
}
