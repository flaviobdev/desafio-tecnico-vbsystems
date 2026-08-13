import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { LoginGatewayDto } from '../gateway-integration/dto/login-gateway-dto.dto';
import { GatewayAccount } from '../gateway-integration/entities/gateway-account.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly leraBox: LeraBoxService,
    private readonly jwtService: JwtService,
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountsRepository: Repository<GatewayAccount>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async login(data: LoginGatewayDto) {
    const response = await this.leraBox.loginUser(data);
    const token: string = response.access_token;
    const codigoCliente = String(response.codigoCliente);
    const chaveLoja: string = response.chaveLoja;

    let account = await this.gatewayAccountsRepository.findOne({
      where: { document: data.document },
    });
    if (!account) {
      account = this.gatewayAccountsRepository.create({
        document: data.document,
      });
    }
    const user = await this.usersRepository.findOne({
      where: { document: data.document },
    });

    account.token = token;
    account.codigoCliente = codigoCliente;
    account.chaveLoja = chaveLoja;
    account.user = user ?? null;
    await this.gatewayAccountsRepository.save(account);

    const accessToken = await this.jwtService.signAsync({
      sub: account.id,
      document: account.document,
    });

    return {
      accessToken,
      user: {
        name: user?.name ?? account.document,
        document: account.document,
      },
    };
  }
}
