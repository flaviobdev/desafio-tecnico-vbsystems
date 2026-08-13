import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import {
  TransactionStatus,
  TransactionType,
} from './get-transactions-query.dto';

export class TransactionResponseDto {
  @ApiProperty({ description: 'Id da transação no gateway Lera Box' })
  id!: string;

  @ApiProperty({ enum: TransactionType })
  type!: TransactionType;

  @ApiProperty({ enum: TransactionStatus })
  status!: TransactionStatus;

  @ApiProperty({ description: 'Valor em centavos', example: 10000 })
  amountCents!: number;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({
    description:
      'Id do pedido local (BaaS), quando a transação tem comprovante em /checkout/:id',
    nullable: true,
  })
  orderId!: string | null;
}

export class TransactionsPageDto extends PaginatedResponseDto {
  @ApiProperty({ type: [TransactionResponseDto] })
  data!: TransactionResponseDto[];
}
