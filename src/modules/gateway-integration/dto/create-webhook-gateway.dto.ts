import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum WebhookEvent {
  PAYMENT_PIX = 'PAYMENT_PIX',
  PAYMENT_CARD = 'PAYMENT_CARD',
  WITHDRAWAL = 'WITHDRAWAL',
}

export class CreateWebhookGatewayDto {
  @ApiProperty({
    enum: WebhookEvent,
    description:
      'Evento que dispara o callback. Cadastrar de novo para o mesmo evento atualiza a URL/segredo.',
    example: WebhookEvent.PAYMENT_PIX,
  })
  @IsEnum(WebhookEvent)
  @IsNotEmpty()
  event!: WebhookEvent;

  @ApiProperty({
    description: 'URL da própria API BaaS que vai receber o callback',
    example: 'https://seu-sistema.com/api/webhooks/callback/pix',
  })
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiPropertyOptional({
    description:
      'Segredo usado para validar a assinatura HMAC (header X-Lera-Box-Signature). Sem segredo, a assinatura não é validada.',
    example: 'minha-chave-secreta',
  })
  @IsString()
  @IsOptional()
  secret?: string;
}
