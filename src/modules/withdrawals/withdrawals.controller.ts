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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../../common/guards/jwt-auth.guard';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawGatewayDto } from '../gateway-integration/dto/create-withdraw-gateway.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('withdrawals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  createWithdrawal(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateWithdrawGatewayDto,
  ) {
    return this.withdrawalsService.createWithdrawal(req.gatewayAccountId, dto);
  }

  @Get()
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
  getWithdrawalById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.withdrawalsService.getWithdrawalById(req.gatewayAccountId, id);
  }
}
