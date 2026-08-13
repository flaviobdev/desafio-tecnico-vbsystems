import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../../common/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import {
  GetTransactionsQueryDto,
  TransactionStatus,
  TransactionType,
} from './dto/get-transactions-query.dto';
import { WalletBalanceDto } from './dto/wallet-balance.dto';
import { TransactionsPageDto } from './dto/transaction-response.dto';

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({
    summary: 'Saldo disponível',
    description: 'Saldo em centavos, direto do gateway.',
  })
  @ApiOkResponse({ type: WalletBalanceDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  getBalance(@Req() req: AuthenticatedRequest) {
    return this.walletService.getBalance(req.gatewayAccountId);
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'Extrato consolidado',
    description:
      'Extrato do gateway paginado no backend (a Lera Box só suporta um `limit`, sem offset/page), com o id do pedido local anexado quando a transação tem comprovante em /checkout/:id.',
  })
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiOkResponse({ type: TransactionsPageDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  getTransactions(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetTransactionsQueryDto,
  ) {
    return this.walletService.getTransactions(req.gatewayAccountId, query);
  }
}
