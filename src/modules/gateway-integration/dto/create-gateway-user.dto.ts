import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum PersonType {
  PF = 'PF',
  PJ = 'PJ',
}

export class CreateGatewayUserDto {
  @ApiProperty({
    enum: PersonType,
    description: 'Pessoa física ou jurídica',
    example: PersonType.PF,
  })
  @IsEnum(PersonType)
  @IsNotEmpty()
  personType!: PersonType;

  @ApiProperty({
    description: 'Nome completo (PF) ou razão social (PJ)',
    example: 'Fulano da Silva',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Nome fantasia (apenas PJ)',
    example: 'Loja do Fulano',
  })
  @IsOptional()
  @IsString()
  tradingName?: string;

  @ApiProperty({
    description: 'E-mail real — recebe as credenciais do gateway',
    example: 'fulano@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Telefone real com DDD', example: '11999999999' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ description: 'CPF (PF) ou CNPJ (PJ)', example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  document!: string;

  @ApiProperty({ description: 'CEP', example: '01001000' })
  @IsString()
  @IsNotEmpty()
  zipCode!: string;

  @ApiProperty({ description: 'Logradouro', example: 'Praça da Sé' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ description: 'Número do endereço', example: '100' })
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiPropertyOptional({ description: 'Complemento', example: 'Sala 2' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ description: 'Bairro', example: 'Sé' })
  @IsString()
  @IsNotEmpty()
  neighborhood!: string;

  @ApiProperty({ description: 'Cidade', example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ description: 'UF', example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state!: string;
}
