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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../../common/guards/jwt-auth.guard';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookGatewayDto } from '../gateway-integration/dto/create-webhook-gateway.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  upsertWebhook(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateWebhookGatewayDto,
  ) {
    return this.webhooksService.upsertWebhook(req.gatewayAccountId, dto);
  }

  @Get()
  listWebhooks(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginationQueryDto,
  ) {
    return this.webhooksService.listWebhooks(req.gatewayAccountId, query.page);
  }

  @Delete(':id')
  @HttpCode(204)
  removeWebhook(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.webhooksService.removeWebhook(req.gatewayAccountId, id);
  }
}
