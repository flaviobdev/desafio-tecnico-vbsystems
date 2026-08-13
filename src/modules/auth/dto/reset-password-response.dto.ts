import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ description: 'Status devolvido pelo gateway', example: 201 })
  statusCode!: number;
}
