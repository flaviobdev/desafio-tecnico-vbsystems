import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';
import { WebhookEvent } from '../gateway-integration/dto/create-webhook-gateway.dto';

@ApiTags('webhooks')
@Controller('webhooks/callback')
export class WebhooksCallbackController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('pix')
  @HttpCode(200)
  handlePixCallback(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-lera-box-signature') signature: string | undefined,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.webhooksService.handleCallback(
      WebhookEvent.PAYMENT_PIX,
      req.rawBody ?? Buffer.alloc(0),
      signature,
      payload,
    );
  }

  @Post('card')
  @HttpCode(200)
  handleCardCallback(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-lera-box-signature') signature: string | undefined,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.webhooksService.handleCallback(
      WebhookEvent.PAYMENT_CARD,
      req.rawBody ?? Buffer.alloc(0),
      signature,
      payload,
    );
  }

  @Post('withdrawal')
  @HttpCode(200)
  handleWithdrawalCallback(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-lera-box-signature') signature: string | undefined,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.webhooksService.handleCallback(
      WebhookEvent.WITHDRAWAL,
      req.rawBody ?? Buffer.alloc(0),
      signature,
      payload,
    );
  }
}
