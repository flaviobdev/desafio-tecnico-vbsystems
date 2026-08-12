import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { GetTransactionsQueryDto, TransactionStatus, TransactionType } from './dto/get-transactions-query.dto';

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getBalance(@Req() req: AuthenticatedRequest) {
    return this.walletService.getBalance(req.gatewayAccountId);
  }

  @Get('transactions')
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  getTransactions(@Req() req: AuthenticatedRequest, @Query() query: GetTransactionsQueryDto) {
    return this.walletService.getTransactions(req.gatewayAccountId, query);
  }
}
