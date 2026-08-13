import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateWithdrawGatewayDto {
  @ApiProperty({
    description: 'Valor do saque em centavos',
    example: 10000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({
    description: 'Chave Pix de destino (e-mail, CPF/CNPJ, telefone ou EVP)',
    example: '00020126580014br.gov.bcb.pix...',
  })
  @IsString()
  @IsNotEmpty()
  pixKey!: string;

  @ApiProperty({
    description: 'CPF/CNPJ do titular da chave Pix',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  document!: string;

  @ApiPropertyOptional({
    description: 'Descrição livre do saque',
    example: 'Saque para conta pessoal',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Referência externa para conciliar no webhook',
    example: 'SAQUE-001',
  })
  @IsString()
  @IsOptional()
  externalReference?: string;
}
