import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalsController } from './withdrawals.controller';
import { AuthModule } from '../auth/auth.module';
import { GatewayIntegrationModule } from '../gateway-integration/gateway-integration.module';
import { Withdrawal } from './entities/withdrawal.entity';

@Module({
  imports: [
    GatewayIntegrationModule,
    AuthModule,
    TypeOrmModule.forFeature([Withdrawal]),
  ],
  providers: [WithdrawalsService],
  controllers: [WithdrawalsController],
})
export class WithdrawalsModule {}
