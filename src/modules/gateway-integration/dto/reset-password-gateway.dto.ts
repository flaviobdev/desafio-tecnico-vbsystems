import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordGatewayDto {
  @ApiProperty({
    description: 'CPF/CNPJ cadastrado no gateway',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  document!: string;

  @ApiProperty({
    description:
      'E-mail cadastrado — precisa coincidir com o documento; recebe a nova senha',
    example: 'fulano@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
