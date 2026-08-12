import { IsIn, IsOptional } from 'class-validator';
import { CardBrand } from '../../gateway-integration/dto/card-brand.enum';

export class GetFeesQueryDto {
  @IsOptional()
  @IsIn(Object.values(CardBrand))
  brand?: CardBrand;
}
