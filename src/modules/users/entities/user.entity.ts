import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PersonType } from '../../gateway-integration/dto/create-gateway-user.dto';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: PersonType })
  personType!: PersonType;

  @Column()
  name!: string;

  @Column({ nullable: true })
  tradingName?: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  phone!: string;

  @Column({ unique: true })
  document!: string;

  @Column()
  zipCode!: string;

  @Column()
  address!: string;

  @Column()
  number!: string;

  @Column({ nullable: true })
  complement?: string;

  @Column()
  neighborhood!: string;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
