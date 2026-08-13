import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CardBrand } from '../../gateway-integration/dto/card-brand.enum';

export class GetFeesQueryDto {
  @ApiPropertyOptional({
    enum: CardBrand,
    description: 'Filtra a tabela de taxas por bandeira',
  })
  @IsOptional()
  @IsIn(Object.values(CardBrand))
  brand?: CardBrand;
}
