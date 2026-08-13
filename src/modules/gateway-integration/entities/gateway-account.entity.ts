import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../checkout/entities/order.entity';

@Entity('gateway_accounts')
export class GatewayAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  document!: string;

  @Column('text')
  token!: string;

  @Column()
  codigoCliente!: string;

  @Column()
  chaveLoja!: string;

  @OneToOne(() => User, (user) => user.gatewayAccount, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

  @OneToMany(() => Order, (order) => order.gatewayAccount)
  orders!: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
