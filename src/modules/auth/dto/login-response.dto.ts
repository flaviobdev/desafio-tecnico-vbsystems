import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description:
      'Nome do lojista (ou o próprio documento, se ainda não houver cadastro local)',
    example: 'Fulano da Silva',
  })
  name!: string;

  @ApiProperty({
    description: 'CPF/CNPJ usado no login',
    example: '12345678901',
  })
  document!: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description:
      'JWT do BaaS — use como `Bearer <accessToken>` nas demais rotas',
  })
  accessToken!: string;

  @ApiProperty({ type: LoginUserDto })
  user!: LoginUserDto;
}
