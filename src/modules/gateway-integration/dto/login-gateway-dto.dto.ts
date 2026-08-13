import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginGatewayDto {
  @ApiProperty({
    description: 'CPF/CNPJ usado no cadastro do gateway',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  document!: string;

  @ApiProperty({
    description: 'Senha recebida por e-mail no cadastro',
    example: 'Sen4aF0rte!',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
