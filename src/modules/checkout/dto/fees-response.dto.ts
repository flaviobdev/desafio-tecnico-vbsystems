import { ApiProperty } from '@nestjs/swagger';
import { CardBrand } from '../../gateway-integration/dto/card-brand.enum';

export class FeeDto {
  @ApiProperty({ example: 'fee-visa-3x' })
  id!: string;

  @ApiProperty({ enum: CardBrand })
  brand!: string;

  @ApiProperty({ example: 3 })
  installments!: number;

  @ApiProperty({ description: 'Taxa em %', example: 4.5 })
  feePercent!: number;

  @ApiProperty({ example: '4.5%' })
  feePercentFormatted!: string;
}

export class FeesResponseDto {
  @ApiProperty({ example: 21 })
  total!: number;

  @ApiProperty({ type: [FeeDto] })
  fees!: FeeDto[];
}
