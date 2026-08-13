import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WebhooksCallbackController } from './webhooks-callback.controller';
import { AuthModule } from '../auth/auth.module';
import { GatewayIntegrationModule } from '../gateway-integration/gateway-integration.module';
import { Order } from '../checkout/entities/order.entity';
import { Withdrawal } from '../withdrawals/entities/withdrawal.entity';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhookEventLog } from './entities/webhook-event-log.entity';

@Module({
  imports: [
    GatewayIntegrationModule,
    AuthModule,
    TypeOrmModule.forFeature([
      Order,
      Withdrawal,
      WebhookSubscription,
      WebhookEventLog,
    ]),
  ],
  providers: [WebhooksService],
  controllers: [WebhooksController, WebhooksCallbackController],
})
export class WebhooksModule {}
