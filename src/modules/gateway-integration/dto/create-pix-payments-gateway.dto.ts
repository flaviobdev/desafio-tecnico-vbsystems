import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PixGatewayPaymentsDto {
  @ApiProperty({
    description: 'Valor da cobrança em centavos',
    example: 1000,
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

  @ApiProperty({
    description: 'CPF ou CNPJ do pagador',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  payerDocument!: string;

  @ApiPropertyOptional({
    description: 'Referência externa para conciliação',
    example: 'PEDIDO-123',
  })
  @IsString()
  @IsOptional()
  externalReference!: string;
}
