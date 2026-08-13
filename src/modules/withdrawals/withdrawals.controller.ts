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
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawGatewayDto } from '../gateway-integration/dto/create-withdraw-gateway.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  WithdrawalResponseDto,
  WithdrawalsPageDto,
} from './dto/withdrawal-response.dto';

@ApiTags('withdrawals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  @ApiOperation({
    summary: 'Solicitar saque',
    description:
      'Se o saldo real for insuficiente, o gateway nega com INSUFFICIENT_BALANCE; caso contrário simula aprovação/negação. Aprovação debita a carteira no gateway.',
  })
  @ApiCreatedResponse({
    description: 'Saque solicitado (aprovado ou negado)',
    type: WithdrawalResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiBadRequestResponse({
    description: 'amount, pixKey ou document inválidos',
  })
  createWithdrawal(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateWithdrawGatewayDto,
  ) {
    return this.withdrawalsService.createWithdrawal(req.gatewayAccountId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar saques da conta',
    description: 'Paginado, mais recentes primeiro.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiOkResponse({ type: WithdrawalsPageDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  listWithdrawals(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginationQueryDto,
  ) {
    return this.withdrawalsService.listWithdrawals(
      req.gatewayAccountId,
      query.page,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar status do saque',
    description:
      'Enquanto PENDING, reconsulta o gateway como fallback pro webhook.',
  })
  @ApiParam({ name: 'id', description: 'Id local do saque (BaaS)' })
  @ApiOkResponse({ type: WithdrawalResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Saque não encontrado para esta conta' })
  getWithdrawalById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.withdrawalsService.getWithdrawalById(req.gatewayAccountId, id);
  }
}
