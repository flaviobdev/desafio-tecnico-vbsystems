import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateGatewayUserDto } from './dto/create-gateway-user.dto';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { LoginGatewayDto } from './dto/login-gateway-dto.dto';
import { PixGatewayPaymentsDto } from './dto/create-pix-payments-gateway.dto';
import { CardGatewayPaymentsDto } from './dto/create-card-payments-gateway.dto';
import { CreateWithdrawGatewayDto } from './dto/create-withdraw-gateway.dto';
import { toGatewayException } from '../../common/errors/gateway-error.util';

@Injectable()
export class LeraBoxService {
  private readonly logger = new Logger(LeraBoxService.name);
  private readonly baseUrl = 'https://api.branchpay.com.br/api';

  constructor(private readonly http: HttpService) {}

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
      throw toGatewayException(
        error,
        'Não foi possível cadastrar o usuário no gateway',
      );
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
      throw toGatewayException(
        error,
        'Não foi possível logar o usuário no gateway',
      );
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
      throw toGatewayException(
        error,
        'Não foi possível consultar a carteira no gateway',
      );
    }
  }

  async getTransactions(
    token: string,
    params: { limit?: string; status?: string; type?: string },
  ): Promise<GatewayTransactionsResponse> {
    try {
      const response = await firstValueFrom(
        this.http.get<GatewayTransactionsResponse>(
          `${this.baseUrl}/wallet/transactions`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params,
          },
        ),
      );

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Falha ao consultar extrato no gateway: ${err.response?.status} ${JSON.stringify(err.response?.data)}`,
      );
      throw toGatewayException(
        error,
        'Não foi possível consultar o extrato de transações no gateway',
      );
    }
  }

  async createPixPayment(token: string, data: PixGatewayPaymentsDto) {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/payments/pix`, data, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Falha ao criar pagamento PIX no gateway: ${err.response?.status} ${JSON.stringify(err.response?.data)}`,
      );
      throw toGatewayException(
        error,
        'Não foi possível realizar o pagamento PIX no gateway',
      );
    }
  }

  async getFees(brand?: string): Promise<GatewayFeesResponse> {
    try {
      const response = await firstValueFrom(
        this.http.get<GatewayFeesResponse>(`${this.baseUrl}/fees`, {
          params: brand ? { brand } : undefined,
        }),
      );

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Falha ao consultar taxas no gateway: ${err.response?.status} ${JSON.stringify(err.response?.data)}`,
      );
      throw toGatewayException(
        error,
        'Não foi possível consultar as taxas no gateway',
      );
    }
  }

  async createCardPayment(
    token: string,
    data: CardGatewayPaymentsDto,
  ): Promise<GatewayCardPaymentResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<GatewayCardPaymentResponse>(
          `${this.baseUrl}/payments/card`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Falha ao criar pagamento com cartão no gateway: ${err.response?.status} ${JSON.stringify(err.response?.data)}`,
      );
      throw toGatewayException(
        error,
        'Não foi possível realizar o pagamento com cartão no gateway',
      );
    }
  }

  async getPaymentById(
    token: string,
    gatewayTransactionId: string,
  ): Promise<GatewayTransaction> {
    try {
      const response = await firstValueFrom(
        this.http.get<GatewayTransaction>(
          `${this.baseUrl}/payments/${gatewayTransactionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Falha ao consultar pagamento no gateway: ${err.response?.status} ${JSON.stringify(err.response?.data)}`,
      );
      throw toGatewayException(
        error,
        'Não foi possível consultar o pagamento no gateway',
      );
    }
  }

  async createWithdrawal(
    token: string,
    data: CreateWithdrawGatewayDto,
  ): Promise<GatewayWithdrawal> {
    try {
      const response = await firstValueFrom(
        this.http.post<GatewayWithdrawal>(`${this.baseUrl}/withdrawals`, data, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Falha ao solicitar saque no gateway: ${err.response?.status} ${JSON.stringify(err.response?.data)}`,
      );
      throw toGatewayException(
        error,
        'Não foi possível solicitar o saque no gateway',
      );
    }
  }

  async getWithdrawalById(
    token: string,
    gatewayTransactionId: string,
  ): Promise<GatewayWithdrawal> {
    try {
      const response = await firstValueFrom(
        this.http.get<GatewayWithdrawal>(
          `${this.baseUrl}/withdrawals/${gatewayTransactionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Falha ao consultar saque no gateway: ${err.response?.status} ${JSON.stringify(err.response?.data)}`,
      );
      throw toGatewayException(
        error,
        'Não foi possível consultar o saque no gateway',
      );
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

export type GatewayTransaction = {
  id: string;
  type: string;
  status: string;
  denialReason: string | null;
  amount: number;
  amountFormatted: string;
  description: string;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type GatewayTransactionsResponse = {
  walletId: string;
  balance: number;
  balanceFormatted: string;
  filters: { status: string | null; type: string | null };
  transactions: GatewayTransaction[];
};

export type GatewayFee = {
  id: string;
  brand: string;
  installments: number;
  feePercent: number;
  feePercentFormatted: string;
};

export type GatewayFeesResponse = {
  total: number;
  fees: GatewayFee[];
};

export type GatewayCardPaymentResponse = {
  id: string;
  status: string;
  denialReason: string | null;
  amount: number;
  externalReference: string | null;
  metadata: {
    cardBrand: string;
    cardLast4: string;
    installments: number;
    feePercent: number;
    netAmountCents: number;
  };
};

export type GatewayWithdrawal = {
  id: string;
  status: string;
  denialReason: string | null;
  amount: number;
  pixKey: string;
  document: string;
  description: string | null;
  externalReference: string | null;
  createdAt: string;
};
