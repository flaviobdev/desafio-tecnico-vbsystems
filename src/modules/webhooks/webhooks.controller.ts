import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
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
import { WebhooksService } from './webhooks.service';
import { CreateWebhookGatewayDto } from '../gateway-integration/dto/create-webhook-gateway.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  WebhookResponseDto,
  WebhooksPageDto,
} from './dto/webhook-response.dto';

@ApiTags('webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastrar (ou atualizar) um webhook por evento',
    description:
      'Um URL por evento — cadastrar de novo para o mesmo evento atualiza a URL/segredo. O segredo, se informado, é usado depois pra validar o header X-Lera-Box-Signature nos callbacks recebidos.',
  })
  @ApiCreatedResponse({
    description: 'Webhook cadastrado/atualizado',
    type: WebhookResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  upsertWebhook(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateWebhookGatewayDto,
  ) {
    return this.webhooksService.upsertWebhook(req.gatewayAccountId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar webhooks cadastrados',
    description: 'Paginado.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiOkResponse({ type: WebhooksPageDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  listWebhooks(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginationQueryDto,
  ) {
    return this.webhooksService.listWebhooks(req.gatewayAccountId, query.page);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover um webhook' })
  @ApiParam({ name: 'id', description: 'Id do webhook no gateway Lera Box' })
  @ApiNoContentResponse({ description: 'Webhook removido' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  removeWebhook(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.webhooksService.removeWebhook(req.gatewayAccountId, id);
  }
}
