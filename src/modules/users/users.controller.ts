import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { CreateGatewayUserDto } from '../gateway-integration/dto/create-gateway-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Cadastro público de lojista (PF/PJ)',
    description:
      'Cria o cadastro no gateway Lera Box (que envia documento, senha, CodigoCliente e ChaveLoja por e-mail) e espelha os dados localmente. Não retorna nenhuma credencial do gateway. Limitado a 5 cadastros por minuto por IP.',
  })
  @ApiCreatedResponse({
    description: 'Cadastro criado e espelhado localmente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Campo obrigatório faltando, e-mail inválido ou personType inválido',
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas — aguarde antes de tentar de novo',
  })
  create(@Body() dto: CreateGatewayUserDto) {
    return this.usersService.create(dto);
  }
}
