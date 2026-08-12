import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayIntegrationModule } from '../gateway-integration/gateway-integration.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), GatewayIntegrationModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
