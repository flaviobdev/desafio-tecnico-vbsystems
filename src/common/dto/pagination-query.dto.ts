import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export const PAGE_SIZE = 10;

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: `Página da listagem (${PAGE_SIZE} itens por página)`,
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
