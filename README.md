# 💰 Sistema de Controle Financeiro Automatizado

Aplicação web para controle de receitas e despesas pessoais, com autenticação
JWT, categorização de transações, resumo mensal e automações via **n8n**.

## 📋 Sobre o projeto

Full stack de controle financeiro pessoal construído para praticar (e mostrar)
boas práticas de backend e frontend: autenticação segura, validação de
entrada, tratamento de erro centralizado, paginação, e uma interface limpa em
Next.js.

## 🛠️ Stack

**Backend**
- Node.js + Express
- Prisma ORM + MySQL
- JWT (autenticação) + bcrypt (hash de senha)
- Zod (validação de entrada)
- Helmet, CORS e rate limiting (segurança)

**Frontend**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Recharts (gráficos)
- Axios

**Automação**
- n8n (workflows de notificação/relatório — ver seção [Automações com n8n](#-automações-com-n8n))

## 📁 Estrutura

```
backend/
  app.js            # configuração do Express (rotas, middlewares)
  server.js          # bootstrap: valida env e sobe o servidor
  config/            # validação de variáveis de ambiente
  controllers/        # lógica das rotas
  lib/prisma.js       # instância única do Prisma Client
  middlewares/        # autenticação, erro, rate limit
  routes/             # definição dos endpoints
  utils/              # AppError
  validators/          # schemas Zod de entrada
  prisma/              # schema e migrações
  tests/               # testes automatizados (Jest + Supertest)

frontend/
  src/app/            # páginas (login, registrar, dashboard, transações)
  src/components/      # componentes reutilizáveis
  src/hooks/           # useAuth
  src/lib/             # cliente HTTP (axios)
  src/types/           # tipos TypeScript compartilhados

n8n/
  workflows/           # workflows exportados (.json) para importar no n8n
```

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 18+
- MySQL rodando localmente (ou acessível via `DATABASE_URL`)
- (Opcional) n8n, se for usar as automações

### 1. Backend

```bash
cd backend
cp .env.example .env
# edite o .env com sua string de conexão MySQL e um JWT_SECRET forte
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

A API sobe em `http://localhost:3000`. Teste com `GET /health`.

### 2. Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
npm run dev
```

Acesse a URL que aparecer no terminal (geralmente `http://localhost:3001`).

### 3. Rodar os testes do backend

```bash
cd backend
npm test
```

## 🔌 Endpoints da API

| Método | Rota                | Auth | Descrição                          |
|--------|---------------------|------|--------------------------------------|
| POST   | /auth/registrar     | Não  | Cria um novo usuário                 |
| POST   | /auth/login         | Não  | Autentica e retorna um token JWT     |
| GET    | /transacoes         | Sim  | Lista transações (paginado, filtros) |
| POST   | /transacoes         | Sim  | Cria uma transação                   |
| GET    | /transacoes/saldo   | Sim  | Saldo atual (receitas − despesas)    |
| GET    | /transacoes/resumo  | Sim  | Resumo mensal agrupado por categoria |
| GET    | /transacoes/:id     | Sim  | Detalhe de uma transação             |
| PUT    | /transacoes/:id     | Sim  | Edita uma transação                  |
| DELETE | /transacoes/:id     | Sim  | Remove uma transação                 |

Rotas autenticadas exigem o header `Authorization: Bearer <token>`.

## 🔐 Segurança

- Senhas com hash `bcrypt`
- Tokens JWT assinados com segredo validado na inicialização (mínimo 32 caracteres)
- Rate limiting nas rotas de login/registro (10 tentativas / 15 min)
- Cabeçalhos de segurança via `helmet`
- CORS restrito por variável de ambiente
- Validação de entrada em todas as rotas via Zod
- Tratamento de erro centralizado (nunca vaza stack trace pro cliente)

## 🤖 Automações com n8n

O projeto inclui dois workflows prontos em `n8n/workflows/`:

- **Alerta de saldo baixo** — verifica o saldo diariamente e envia um email
  quando fica abaixo de um limite configurável.
- **Importação de transações via CSV** — lê um arquivo CSV local e cria as
  transações automaticamente na API.

Instruções completas de importação e configuração no
[`n8n/README.md`](n8n/README.md).

## 🗺️ Roadmap / limitações conhecidas

- [ ] Testes automatizados (em andamento)
- [ ] Fluxo de "esqueci minha senha"
- [ ] Documentação OpenAPI/Swagger
- [ ] Token em cookie `httpOnly` em vez de `localStorage`
- [ ] API key dedicada para integrações n8n (hoje usa login de usuário)

## 📄 Licença

Este projeto está sob a licença MIT — veja o arquivo [LICENSE](LICENSE) para detalhes.
