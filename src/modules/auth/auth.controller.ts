import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginGatewayDto } from '../gateway-integration/dto/login-gateway-dto.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Login no gateway e emissão do JWT do BaaS',
    description:
      'Autentica com o documento/senha do cadastro no Lera Box, vincula (ou cria) o gateway_account local e devolve um JWT próprio do BaaS — o token/senha do gateway nunca chegam ao frontend. Limitado a 5 tentativas por minuto por IP.',
  })
  @ApiCreatedResponse({
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Documento ou senha inválidos' })
  @ApiResponse({
    status: 400,
    description:
      'Corpo da requisição inválido (campo faltando ou mal formatado)',
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas — aguarde antes de tentar de novo',
  })
  login(@Body() dto: LoginGatewayDto) {
    return this.authService.login(dto);
  }
}
