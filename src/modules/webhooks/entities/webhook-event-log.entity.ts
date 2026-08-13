import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WebhookEvent } from '../../gateway-integration/dto/create-webhook-gateway.dto';

@Entity('webhook_events')
@Index(['gatewayTransactionId', 'status'])
export class WebhookEventLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: WebhookEvent })
  event!: WebhookEvent;

  @Column({ type: 'varchar', nullable: true })
  gatewayAccountId!: string | null;

  @Column()
  gatewayTransactionId!: string;

  @Column()
  status!: string;

  @Column({ type: 'json' })
  payload!: unknown;

  @Column()
  signatureValid!: boolean;

  @Column({ type: 'datetime', nullable: true })
  processedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
