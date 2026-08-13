import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { GatewayAccount } from '../../gateway-integration/entities/gateway-account.entity';
import { WebhookEvent } from '../../gateway-integration/dto/create-webhook-gateway.dto';

@Entity('webhook_subscriptions')
@Index(['gatewayAccount', 'event'], { unique: true })
export class WebhookSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => GatewayAccount)
  @JoinColumn({ name: 'gatewayAccountId' })
  gatewayAccount!: GatewayAccount;

  @RelationId(
    (subscription: WebhookSubscription) => subscription.gatewayAccount,
  )
  gatewayAccountId!: string;

  @Column({ type: 'enum', enum: WebhookEvent })
  event!: WebhookEvent;

  @Column()
  gatewayWebhookId!: string;

  @Column({ type: 'varchar', nullable: true })
  secret!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
