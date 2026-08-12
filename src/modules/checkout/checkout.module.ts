import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { AuthModule } from '../auth/auth.module';
import { GatewayIntegrationModule } from '../gateway-integration/gateway-integration.module';
import { Order } from './entities/order.entity';

@Module({
  imports: [GatewayIntegrationModule, AuthModule, TypeOrmModule.forFeature([Order])],
  providers: [CheckoutService],
  controllers: [CheckoutController]
})
export class CheckoutModule {}
