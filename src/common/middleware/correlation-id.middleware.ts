import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export type RequestWithCorrelationId = Request & { correlationId: string };

const HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const incoming = req.headers[HEADER];
    const correlationId =
      (Array.isArray(incoming) ? incoming[0] : incoming) || randomUUID();

    (req as RequestWithCorrelationId).correlationId = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);

    const start = Date.now();
    res.on('finish', () => {
      this.logger.log(
        `[${correlationId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`,
      );
    });

    next();
  }
}
