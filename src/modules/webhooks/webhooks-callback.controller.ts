import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';
import { WebhookEvent } from '../gateway-integration/dto/create-webhook-gateway.dto';

const CALLBACK_DESCRIPTION =
  'Endpoint público (sem JWT) que o gateway Lera Box chama para notificar o resultado definitivo de uma transação. ' +
  'Valida o header X-Lera-Box-Signature (HMAC) contra o segredo cadastrado em POST /webhooks para esse evento — se ' +
  'não houver segredo cadastrado, a assinatura não é validada. É idempotente: uma vez que o pedido/saque sai de ' +
  'PENDING, notificações repetidas ou tardias para a mesma transação são ignoradas.';

@ApiTags('webhooks')
@Controller('webhooks/callback')
export class WebhooksCallbackController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('pix')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Callback de pagamento Pix',
    description: CALLBACK_DESCRIPTION,
  })
  @ApiHeader({
    name: 'x-lera-box-signature',
    required: false,
    description: 'Assinatura HMAC-SHA256 do corpo bruto da requisição',
  })
  @ApiOkResponse({
    description: 'Evento processado (ou ignorado, se já resolvido)',
  })
  @ApiBadRequestResponse({
    description: 'Payload sem id e/ou status da transação',
  })
  @ApiUnauthorizedResponse({
    description: 'Assinatura inválida para um webhook com segredo cadastrado',
  })
  @ApiNotFoundResponse({
    description: 'Nenhum pedido local corresponde ao id de transação informado',
  })
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
  @ApiOperation({
    summary: 'Callback de pagamento com cartão',
    description: CALLBACK_DESCRIPTION,
  })
  @ApiHeader({
    name: 'x-lera-box-signature',
    required: false,
    description: 'Assinatura HMAC-SHA256 do corpo bruto da requisição',
  })
  @ApiOkResponse({
    description: 'Evento processado (ou ignorado, se já resolvido)',
  })
  @ApiBadRequestResponse({
    description: 'Payload sem id e/ou status da transação',
  })
  @ApiUnauthorizedResponse({
    description: 'Assinatura inválida para um webhook com segredo cadastrado',
  })
  @ApiNotFoundResponse({
    description: 'Nenhum pedido local corresponde ao id de transação informado',
  })
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
  @ApiOperation({
    summary: 'Callback de saque',
    description: CALLBACK_DESCRIPTION,
  })
  @ApiHeader({
    name: 'x-lera-box-signature',
    required: false,
    description: 'Assinatura HMAC-SHA256 do corpo bruto da requisição',
  })
  @ApiOkResponse({
    description: 'Evento processado (ou ignorado, se já resolvido)',
  })
  @ApiBadRequestResponse({
    description: 'Payload sem id e/ou status da transação',
  })
  @ApiUnauthorizedResponse({
    description: 'Assinatura inválida para um webhook com segredo cadastrado',
  })
  @ApiNotFoundResponse({
    description: 'Nenhum saque local corresponde ao id de transação informado',
  })
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
