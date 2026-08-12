import { BadGatewayException, HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';

type GatewayErrorBody = {
  message?: string | string[];
};

export function toGatewayException(error: unknown, fallbackMessage: string): HttpException {
  const err = error as AxiosError<GatewayErrorBody>;
  const status = err.response?.status;
  const body = err.response?.data;

  if (status && status >= 400 && status < 500 && body?.message) {
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    return new HttpException(message, status);
  }

  return new BadGatewayException(fallbackMessage);
}
