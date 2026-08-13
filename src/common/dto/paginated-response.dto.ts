import { ApiProperty } from '@nestjs/swagger';

export abstract class PaginatedResponseDto {
  @ApiProperty({
    description: 'Total de itens em todas as páginas',
    example: 42,
  })
  total!: number;

  @ApiProperty({ description: 'Página atual', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Itens por página', example: 10 })
  pageSize!: number;

  @ApiProperty({ description: 'Total de páginas', example: 5 })
  totalPages!: number;
}
