import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { GatewayIntegrationModule } from '../gateway-integration/gateway-integration.module';
import { AuthModule } from '../auth/auth.module';
import { Order } from '../checkout/entities/order.entity';

@Module({
  imports: [GatewayIntegrationModule, AuthModule, TypeOrmModule.forFeature([Order])],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
