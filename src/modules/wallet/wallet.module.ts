import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { GatewayIntegrationModule } from '../gateway-integration/gateway-integration.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [GatewayIntegrationModule, AuthModule],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
