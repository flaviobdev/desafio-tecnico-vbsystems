import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderMethod, OrderStatus } from '../entities/order.entity';

export class OrderResponseDto {
  @ApiProperty({
    description: 'Id local do pedido (BaaS)',
    example: 'b3f1c9de-2f3a-4c9b-9d1e-2a6f0c1d9e11',
  })
  id!: string;

  @ApiProperty({ enum: OrderMethod })
  method!: OrderMethod;

  @ApiProperty({ description: 'Valor em centavos', example: 10000 })
  amount!: number;

  @ApiProperty({
    enum: OrderStatus,
    description:
      'PENDING até o webhook (ou uma nova consulta) confirmar; EXPIRED é aplicado localmente para Pix não pago dentro do prazo',
  })
  status!: OrderStatus;

  @ApiPropertyOptional({
    description: 'Motivo da negação, quando status = DENIED',
    nullable: true,
  })
  denialReason!: string | null;

  @ApiPropertyOptional({
    description: 'CPF/CNPJ do pagador (Pix)',
    nullable: true,
  })
  payerDocument!: string | null;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({
    description: 'Referência externa para conciliação',
    nullable: true,
  })
  externalReference!: string | null;

  @ApiPropertyOptional({
    description: 'Id da transação no gateway Lera Box',
    nullable: true,
  })
  gatewayTransactionId!: string | null;

  @ApiPropertyOptional({
    description: 'Copia-e-cola do Pix (EMV)',
    nullable: true,
  })
  emv!: string | null;

  @ApiPropertyOptional({ description: 'Parcelas (cartão)', nullable: true })
  installments!: number | null;

  @ApiPropertyOptional({
    description: 'Taxa (%) aplicada (cartão)',
    nullable: true,
  })
  feePercent!: number | null;

  @ApiPropertyOptional({ nullable: true })
  cardBrand!: string | null;

  @ApiPropertyOptional({
    description: 'Últimos 4 dígitos do cartão',
    nullable: true,
  })
  cardLast4!: string | null;

  @ApiPropertyOptional({
    description: 'Valor líquido em centavos, após a taxa (cartão)',
    nullable: true,
  })
  netAmountCents!: number | null;

  @ApiPropertyOptional({
    description: 'Validade do Pix pendente (30min após a criação)',
    nullable: true,
  })
  expiresAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;
}
