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

export enum OrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum OrderMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => GatewayAccount, (account) => account.orders)
  @JoinColumn({ name: 'gatewayAccountId' })
  gatewayAccount!: GatewayAccount;

  @RelationId((order: Order) => order.gatewayAccount)
  gatewayAccountId!: string;

  @Column({ type: 'enum', enum: OrderMethod })
  method!: OrderMethod;

  @Column()
  amount!: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ type: 'varchar', nullable: true })
  denialReason!: string | null;

  @Column({ type: 'varchar', nullable: true })
  payerDocument!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', nullable: true })
  externalReference!: string | null;

  @Column({ type: 'varchar', nullable: true })
  gatewayTransactionId!: string | null;

  @Column({ type: 'text', nullable: true })
  emv!: string | null;

  @Column({ type: 'int', nullable: true })
  installments!: number | null;

  @Column({ type: 'float', nullable: true })
  feePercent!: number | null;

  @Column({ type: 'varchar', nullable: true })
  cardBrand!: string | null;

  @Column({ type: 'varchar', nullable: true })
  cardLast4!: string | null;

  @Column({ type: 'int', nullable: true })
  netAmountCents!: number | null;

  @Column({ type: 'json', nullable: true })
  gatewayResponse!: unknown | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
