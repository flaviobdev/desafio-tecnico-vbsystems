import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { PixGatewayPaymentsDto } from '../gateway-integration/dto/create-pix-payments-gateway.dto';
import { CardGatewayPaymentsDto } from '../gateway-integration/dto/create-card-payments-gateway.dto';
import { CardBrand } from '../gateway-integration/dto/card-brand.enum';
import { GetFeesQueryDto } from './dto/get-fees-query.dto';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
    constructor(private readonly checkoutService: CheckoutService) {}

    @Get('fees')
    @ApiQuery({ name: 'brand', required: false, enum: CardBrand })
    getFees(@Query() query: GetFeesQueryDto) {
        return this.checkoutService.getFees(query.brand);
    }

    @Post('pix')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async createPixPayment(@Req() req: AuthenticatedRequest, @Body() dto: PixGatewayPaymentsDto) {
        return this.checkoutService.createPixPayment(req.gatewayAccountId, dto);
    }

    @Post('card')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async createCardPayment(@Req() req: AuthenticatedRequest, @Body() dto: CardGatewayPaymentsDto) {
        return this.checkoutService.createCardPayment(req.gatewayAccountId, dto);
    }

    @Get(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getOrderById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        return this.checkoutService.getOrderById(req.gatewayAccountId, id);
    }
}
