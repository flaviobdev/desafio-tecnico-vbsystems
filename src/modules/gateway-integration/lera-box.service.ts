import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateGatewayUserDto } from './dto/create-gateway-user.dto';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { LoginGatewayDto } from './dto/login-gateway-dto.dto';

@Injectable()
export class LeraBoxService {
  private readonly logger = new Logger(LeraBoxService.name);
  private readonly baseUrl = 'https://api.branchpay.com.br/api';

  constructor(private readonly http: HttpService) { }

  async createUser(data: CreateGatewayUserDto) {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/users`, data),
      );

      return { success: true, statusCode: response.status };
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Falha ao criar usuário no gateway: ${err.response?.status} ${JSON.stringify(err.response?.data)}`,
      );
      throw new BadGatewayException('Não foi possível cadastrar o usuário no gateway');
    }
  }

  async loginUser(data: LoginGatewayDto) {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/auth/login`, data),
      );

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Falha ao logar usuário no gateway: ${err.response?.status} ${JSON.stringify(err.response?.data)}`,
      );
      throw new BadGatewayException('Não foi possível logar o usuário no gateway');
    }
  }

  async getWallet(token: string): Promise<GatewayWallet> {
    try {
      const response = await firstValueFrom(
        this.http.get<GatewayWallet>(`${this.baseUrl}/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Falha ao consultar wallet no gateway: ${err.response?.status} ${JSON.stringify(err.response?.data)}`,
      );
      throw new BadGatewayException('Não foi possível consultar a carteira no gateway');
    }
  }
}

export type GatewayWallet = {
  id: string;
  userId: string;
  balance: number;
  balanceFormatted: string;
  updatedAt: string;
};
