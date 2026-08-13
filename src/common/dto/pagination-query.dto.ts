import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export const PAGE_SIZE = 10;

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
