import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BaaS VBA Systems API')
    .setDescription(
      `API do produto BaaS (Banking as a Service) integrado ao gateway de pagamento simulado **Lera Box**.

O BaaS nunca acessa o banco de dados do gateway nem expõe o Bearer token/senha do gateway ao frontend — toda integração acontece via HTTP, com o token do gateway guardado apenas no backend (\`gateway_accounts\`).

**Autenticação**: faça login em \`POST /api/auth/login\` para receber um JWT próprio do BaaS. Use o botão *Authorize* abaixo e informe \`Bearer <token>\` — todas as rotas marcadas com cadeado exigem esse token, que escopa cada requisição à conta do lojista autenticado.

**Status de pagamento/saque**: nunca confie em atualização de status vinda do frontend — o status definitivo de um pedido Pix/cartão ou de um saque só é confirmado por webhook do gateway (\`POST /api/webhooks/callback/*\`), validado por assinatura HMAC (\`X-Lera-Box-Signature\`) quando um segredo está configurado.

**Valores monetários**: todo campo de valor (\`amount\`, \`balanceCents\`, \`netAmountCents\` etc.) é um inteiro em centavos.`,
    )
    .setVersion('0.0.1')
    .addTag('auth', 'Cadastro e login no gateway; emissão do JWT do BaaS')
    .addTag('users', 'Cadastro público de lojistas (PF/PJ) no gateway')
    .addTag('checkout', 'Cobranças Pix e cartão, taxas e comprovante')
    .addTag('wallet', 'Saldo e extrato consolidado da conta')
    .addTag('withdrawals', 'Solicitação e consulta de saques')
    .addTag(
      'webhooks',
      'Cadastro de callbacks e recebimento de eventos assíncronos do gateway',
    )
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Token emitido por POST /api/auth/login',
    })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
