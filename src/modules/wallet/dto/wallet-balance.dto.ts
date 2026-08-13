import { ApiProperty } from '@nestjs/swagger';

export class WalletBalanceDto {
  @ApiProperty({ description: 'Saldo disponível em centavos', example: 123456 })
  balanceCents!: number;

  @ApiProperty({
    description: 'Data/hora da última atualização do saldo no gateway',
  })
  updatedAt!: string;
}
