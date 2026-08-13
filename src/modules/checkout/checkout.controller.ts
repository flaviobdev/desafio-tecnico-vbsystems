import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../../common/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { PixGatewayPaymentsDto } from '../gateway-integration/dto/create-pix-payments-gateway.dto';
import { CardGatewayPaymentsDto } from '../gateway-integration/dto/create-card-payments-gateway.dto';
import { CardBrand } from '../gateway-integration/dto/card-brand.enum';
import { GetFeesQueryDto } from './dto/get-fees-query.dto';
import { FeesResponseDto } from './dto/fees-response.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('fees')
  @ApiOperation({
    summary: 'Tabela de taxas de cartão',
    description:
      'Consulta pública (sem token) as taxas Visa/Master/Elo de 1 a 21x, opcionalmente filtradas por bandeira.',
  })
  @ApiQuery({ name: 'brand', required: false, enum: CardBrand })
  @ApiOkResponse({ type: FeesResponseDto })
  getFees(@Query() query: GetFeesQueryDto) {
    return this.checkoutService.getFees(query.brand);
  }

  @Post('pix')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Criar cobrança Pix',
    description:
      'Cria o pedido no gateway e persiste localmente com status PENDING e validade de 30 minutos. Devolve o EMV (copia-e-cola) e o QR Code pra exibir ao pagador. O status definitivo chega por webhook.',
  })
  @ApiCreatedResponse({
    description: 'Cobrança Pix criada',
    type: OrderResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiBadRequestResponse({ description: 'amount ou payerDocument inválidos' })
  async createPixPayment(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PixGatewayPaymentsDto,
  ) {
    return this.checkoutService.createPixPayment(req.gatewayAccountId, dto);
  }

  @Post('card')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Criar cobrança no cartão',
    description:
      'Valida installments/feePercent contra a tabela de GET /checkout/fees antes de repassar ao gateway (rejeita com 400 se divergente) e persiste o pedido já com o status retornado pelo gateway (aprovação/negação é síncrona para cartão).',
  })
  @ApiCreatedResponse({
    description: 'Cobrança processada (aprovada ou negada)',
    type: OrderResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiBadRequestResponse({
    description:
      'Dados do cartão inválidos ou feePercent não corresponde à tabela vigente',
  })
  async createCardPayment(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CardGatewayPaymentsDto,
  ) {
    return this.checkoutService.createCardPayment(req.gatewayAccountId, dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Consultar pedido por id',
    description:
      'Enquanto PENDING: expira localmente se passou da validade do Pix, senão reconsulta o gateway como fallback (o status definitivo normalmente já chegou por webhook).',
  })
  @ApiParam({ name: 'id', description: 'Id local do pedido (BaaS)' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado para esta conta' })
  async getOrderById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.checkoutService.getOrderById(req.gatewayAccountId, id);
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Cancelar cobrança pendente',
    description: 'Só é possível cancelar enquanto o pedido está PENDING.',
  })
  @ApiParam({ name: 'id', description: 'Id local do pedido (BaaS)' })
  @ApiCreatedResponse({
    description: 'Pedido cancelado',
    type: OrderResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado para esta conta' })
  @ApiConflictResponse({
    description:
      'Pedido já foi resolvido (aprovado/negado/expirado) e não pode mais ser cancelado',
  })
  async cancelOrder(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.checkoutService.cancelOrder(req.gatewayAccountId, id);
  }
}
