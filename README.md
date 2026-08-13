# BaaS VBA Systems

Desafio técnico VBA Systems: um backend BaaS (Banking as a Service) em
NestJS, voltado ao lojista, que integra via HTTP com o gateway de
pagamento simulado **Lera Box** (`https://api.branchpay.com.br`, Swagger
em `/doscs`). O BaaS nunca acessa o banco de dados do gateway — todo
cadastro, login, pagamento, consulta de carteira, saque e webhook
acontece através da API REST do gateway.

## Requisitos

- Node.js 22
- Docker

## Subir tudo com Docker

`docker compose up -d` sobe os três serviços (MySQL, API e frontend) já
prontos, sem precisar instalar Node localmente:

```bash
docker compose up -d --build
```

- API: `http://localhost:3000/api` (Swagger em `http://localhost:3000/docs`)
- Frontend: `http://localhost:5173`
- MySQL: `localhost:3306`

O container da API sobe com `NODE_ENV=development` de propósito — como
ainda não há migrations, é o `synchronize: true` do TypeORM que cria as
tabelas, e isso fica desligado em `NODE_ENV=production`. O frontend é
buildado com `VITE_API_URL` apontando pra API do host (`localhost:3000`
por padrão); pra apontar pra outro endereço, defina `VITE_API_URL` antes
do `up` (ele é lido como build arg do serviço `frontend`).

## Setup local (sem Docker para API/frontend)

1. Copie o arquivo de variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

   Os valores padrão já batem com o `docker-compose.yml`.

2. Suba só o MySQL:

   ```bash
   docker compose up -d mysql
   ```

   O banco fica disponível em `localhost:3306`.

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Rode a API em modo watch:

   ```bash
   npm run start:dev
   ```

A API sobe em `http://localhost:3000/api` e o Swagger em
`http://localhost:3000/docs`.

Não há scripts de migration ainda: o TypeORM roda com `synchronize: true`
fora de `NODE_ENV=production` (ver `src/app.module.ts`), então as tabelas
são criadas automaticamente a partir das entidades.

## Scripts

```bash
npm run start:dev     # API em modo watch
npm run build          # nest build -> dist/
npm run start:prod     # node dist/main (depois do build)
npm run lint            # eslint --fix
npm run format          # prettier --write
npm run test             # testes unitários (jest)
npm run test -- <padrão> # roda um único arquivo de teste, ex: npm run test -- app.controller
npm run test:e2e         # testes e2e (test/jest-e2e.json)
```

## Frontend

Há um scaffold de frontend em React + Vite em [`frontend/`](frontend).
Para rodá-lo:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Estrutura

Cada domínio de negócio vive em `src/modules/<domínio>/`
(`auth`, `users`, `gateway-integration`, `wallet`, `checkout`,
`withdrawals`, `webhooks`), com seu próprio controller/service/entities/DTOs.
Toda a comunicação com o Lera Box passa por `src/modules/gateway-integration/`.
