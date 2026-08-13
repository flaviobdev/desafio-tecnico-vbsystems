import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CardGatewayPaymentsDto {
  @ApiProperty({
    description: 'Valor da cobrança em centavos',
    example: 10000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  @ApiPropertyOptional({
    description: 'Descrição livre da cobrança',
    example: 'Pedido #123',
  })
  @IsString()
  @IsOptional()
  description!: string;

  @ApiPropertyOptional({
    description: 'Referência externa para conciliação',
    example: 'PEDIDO-123',
  })
  @IsString()
  @IsOptional()
  externalReference!: string;

  @ApiProperty({ description: 'Número do cartão', example: '4111111111111111' })
  @IsString()
  @IsNotEmpty()
  cardNumber!: string;

  @ApiProperty({
    description: 'Nome impresso no cartão',
    example: 'FULANO DA SILVA',
  })
  @IsString()
  @IsNotEmpty()
  cardHolder!: string;

  @ApiProperty({ description: 'Mês de validade (MM)', example: '12' })
  @IsString()
  @IsNotEmpty()
  expiryMonth!: string;

  @ApiProperty({ description: 'Ano de validade (AAAA)', example: '2030' })
  @IsString()
  @IsNotEmpty()
  expiryYear!: string;

  @ApiProperty({ description: 'Código de segurança', example: '123' })
  @IsString()
  @IsNotEmpty()
  cvv!: string;

  @ApiProperty({
    description: 'Número de parcelas',
    example: 3,
    minimum: 1,
    maximum: 21,
  })
  @IsInt()
  @Min(1)
  @Max(21)
  installments!: number;

  @ApiProperty({
    description:
      'Taxa (%) da tabela de GET /checkout/fees para a bandeira/parcela escolhidas — validada contra a tabela vigente antes de repassar ao gateway',
    example: 4.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  feePercent!: number;
}
