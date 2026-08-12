import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeraBoxService } from './lera-box.service';
import { GatewayAccount } from './entities/gateway-account.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([GatewayAccount])],
  providers: [LeraBoxService],
  exports: [LeraBoxService, TypeOrmModule],
})
export class GatewayIntegrationModule {}
