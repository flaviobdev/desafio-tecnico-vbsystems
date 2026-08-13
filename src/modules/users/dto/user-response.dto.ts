import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PersonType } from '../../gateway-integration/dto/create-gateway-user.dto';

export class UserResponseDto {
  @ApiProperty({
    description: 'Id local do usuário (BaaS)',
    example: 'b3f1c9de-2f3a-4c9b-9d1e-2a6f0c1d9e11',
  })
  id!: string;

  @ApiProperty({ enum: PersonType })
  personType!: PersonType;

  @ApiProperty({ example: 'Fulano da Silva' })
  name!: string;

  @ApiPropertyOptional({ example: 'Loja do Fulano' })
  tradingName?: string;

  @ApiProperty({ example: 'fulano@example.com' })
  email!: string;

  @ApiProperty({ example: '11999999999' })
  phone!: string;

  @ApiProperty({ example: '12345678901' })
  document!: string;

  @ApiProperty({ example: '01001000' })
  zipCode!: string;

  @ApiProperty({ example: 'Praça da Sé' })
  address!: string;

  @ApiProperty({ example: '100' })
  number!: string;

  @ApiPropertyOptional({ example: 'Sala 2' })
  complement?: string;

  @ApiProperty({ example: 'Sé' })
  neighborhood!: string;

  @ApiProperty({ example: 'São Paulo' })
  city!: string;

  @ApiProperty({ example: 'SP' })
  state!: string;

  @ApiProperty({ description: 'Data de criação do cadastro local' })
  createdAt!: Date;
}
