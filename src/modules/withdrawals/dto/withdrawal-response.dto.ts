import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { WithdrawalStatus } from '../entities/withdrawal.entity';

export class WithdrawalResponseDto {
  @ApiProperty({
    description: 'Id local do saque (BaaS)',
    example: 'b3f1c9de-2f3a-4c9b-9d1e-2a6f0c1d9e11',
  })
  id!: string;

  @ApiProperty({ description: 'Valor em centavos', example: 10000 })
  amount!: number;

  @ApiProperty()
  pixKey!: string;

  @ApiProperty()
  document!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  externalReference!: string | null;

  @ApiProperty({
    enum: WithdrawalStatus,
    description:
      'PENDING até o webhook (ou uma nova consulta) confirmar aprovação/negação do gateway',
  })
  status!: WithdrawalStatus;

  @ApiPropertyOptional({
    description:
      'Motivo da negação (ex.: INSUFFICIENT_BALANCE), quando status = DENIED',
    nullable: true,
  })
  denialReason!: string | null;

  @ApiPropertyOptional({
    description: 'Id da transação no gateway Lera Box',
    nullable: true,
  })
  gatewayTransactionId!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class WithdrawalsPageDto extends PaginatedResponseDto {
  @ApiProperty({ type: [WithdrawalResponseDto] })
  data!: WithdrawalResponseDto[];
}
