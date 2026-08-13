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

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
}

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => GatewayAccount)
  @JoinColumn({ name: 'gatewayAccountId' })
  gatewayAccount!: GatewayAccount;

  @RelationId((withdrawal: Withdrawal) => withdrawal.gatewayAccount)
  gatewayAccountId!: string;

  @Column()
  amount!: number;

  @Column()
  pixKey!: string;

  @Column()
  document!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', nullable: true })
  externalReference!: string | null;

  @Column({
    type: 'enum',
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
  })
  status!: WithdrawalStatus;

  @Column({ type: 'varchar', nullable: true })
  denialReason!: string | null;

  @Column({ type: 'varchar', nullable: true })
  gatewayTransactionId!: string | null;

  @Column({ type: 'json', nullable: true })
  gatewayResponse!: unknown | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
