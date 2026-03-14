# Auth Service

Serviço de autenticação serverless construído com AWS Lambda, Cognito e Serverless Framework. Responsável por gerenciar o registro e autenticação de usuários na plataforma FIAPX.

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração](#configuração)
- [Execução](#execução)
- [Endpoints da API](#endpoints-da-api)
- [Testes](#testes)
- [Deploy](#deploy)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O Auth Service é um microserviço responsável por:

- **Registro de Usuários (SignUp)**: Criar novos usuários no Amazon Cognito
- **Autenticação (Login)**: Autenticar usuários e gerar tokens de acesso
- **Gerenciamento de Identidade**: Integração completa com AWS Cognito Identity Provider

### Tecnologias Utilizadas

- **Runtime**: Node.js 20.x Lambda
- **Linguagem**: TypeScript
- **Infraestrutura**: AWS Lambda, Amazon Cognito, DynamoDB
- **Framework**: Serverless Framework
- **Build**: esbuild
- **Testes**: Jest
- **Desenvolvimento Local**: LocalStack

## 📦 Pré-requisitos

- Node.js 18+ (ou 20+ para produção)
- npm ou yarn
- AWS CLI configurado (para deploy)
- Docker e Docker Compose (para LocalStack)
- Serverless Framework CLI

```bash
npm install -g serverless
```

## 🚀 Instalação

1. Navegue até o diretório do serviço:

```bash
cd services/auth-service
```

2. Instale as dependências:

```bash
npm install
```

## 📁 Estrutura do Projeto

```
auth-service/
├── src/
│   ├── handlers/              # Lambda handlers
│   │   ├── signup.ts         # Handler para registro de usuários
│   │   ├── login.ts          # Handler para autenticação
│   │   └── tests/            # Testes unitários dos handlers
│   │       ├── signup.test.ts
│   │       └── login.test.ts
│   ├── services/             # Lógica de negócio
│   │   ├── user.service.ts   # Serviço de gerenciamento de usuários
│   │   └── tests/
│   │       └── user.service.test.ts
│   └── infra/
│       ├── cognito.ts        # Configuração e inicialização do Cognito
│       └── tests/
│           └── cognito.test.ts
├── tests/
│   └── auth.feature.test.ts  # Testes de integração/feature
├── coverage/                  # Relatórios de cobertura de testes
├── dist/                      # Código compilado (gerado)
├── zips/                      # Arquivos compactados para deploy (gerados)
├── package.json
├── serverless.yml             # Configuração Serverless Framework
├── tsconfig.json              # Configuração TypeScript
├── jest.config.ts             # Configuração Jest
└── deploy-lambda.sh           # Script de deploy
```

## ⚙️ Configuração

### Arquivo: `serverless.yml`

O arquivo de configuração define:

```yaml
service: auth-service
provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  stage: ${opt:stage, 'local'}
  environment:
    TABLE_NAME: auth-service-users-${self:provider.stage}
```

### Cognito Configuration

A configuração do Cognito é carregada dinamicamente através de `src/infra/cognito.ts`. Você precisa ter:

- **User Pool ID**: ID do pool de usuários Cognito
- **App Client ID**: ID do cliente da aplicação no Cognito
- **Region**: Região AWS (padrão: us-east-1)

## 🏃 Execução

### Modo Offline (LocalStack)

Para desenvolver localmente usando LocalStack:

```bash
# Build do projeto
npm run build

# Executar offline com LocalStack
npm run offline
```

O serviço estará disponível em `http://localhost:3000`

### Modo Desenvolvimento

```bash
# Build com watch automático
npm run build -- --watch

# Em outro terminal, execute testes
npm run test:watch
```

## 🔌 Endpoints da API

### 1. Registrar Novo Usuário (SignUp)

**Endpoint**: `POST /auth/create`

**Request Body**:
```json
{
  "username": "john_doe",
  "password": "SecurePassword123!",
  "email": "john@example.com"
}
```

**Response Sucesso (201)**:
```json
{
  "UserSub": "12345678-1234-1234-1234-123456789012"
}
```

**Response Erro (400)**:
```json
{
  "message": "Invalid body request"
}
```

**Response Erro (500)**:
```json
{
  "error": "User already exists"
}
```

### 2. Autenticar Usuário (Login)

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "username": "john_doe",
  "password": "SecurePassword123!"
}
```

**Response Sucesso (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

**Response Erro (401)**:
```json
{
  "message": "Invalid credentials"
}
```

**Response Erro (400)**:
```json
{
  "message": "Invalid body request"
}
```

## 🧪 Testes

### Executar Todos os Testes

```bash
npm test
```

### Modo Watch (desenvolvimento)

```bash
npm run test:watch
```

### Cobertura de Testes

```bash
npm run test:coverage
```

Os relatórios de cobertura serão gerados em `coverage/lcov-report/`.

### Estrutura de Testes

- **Testes Unitários**: `src/**/*.test.ts` - Testes isolados de funções específicas
- **Testes de Integração**: `tests/*.test.ts` - Testes end-to-end de funcionalidades completas

## 📤 Deploy

### Deploy para AWS

```bash
# Build e preparação para deploy
npm run deploy-prep

# Deploy usando Serverless Framework
serverless deploy --stage prod

# Ou use o script de deploy
./deploy-lambda.sh
```

### Deploy para Staging

```bash
npm run deploy-prep
serverless deploy --stage staging
```

### Verificar Status do Deploy

```bash
# Listar funções Lambda
serverless list

# Informações do stack
serverless info --stage prod
```

## 🔐 Variáveis de Ambiente

As seguintes variáveis de ambiente são necessárias:

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `AWS_REGION` | Região AWS | `us-east-1` |
| `COGNITO_USER_POOL_ID` | ID do Cognito User Pool | - |
| `COGNITO_APP_CLIENT_ID` | ID do Cliente Cognito | - |
| `TABLE_NAME` | Nome da tabela DynamoDB | `auth-service-users-${stage}` |
| `STAGE` | Ambiente de execução | `local` |

## 📊 DynamoDB

O serviço cria uma tabela DynamoDB para armazenar dados de usuários:

**Tabela**: `auth-service-users-${stage}`

**Atributos**:
- `username` (String, Primary Key)

**Billing**: Pay-per-request

## 🐛 Troubleshooting

### Problema: LocalStack não inicia

**Solução**: Verifique se Docker está rodando e repositório é executado corretamente:

```bash
docker ps
docker-compose up -d
```

### Problema: Erro de Cognito não configurado

**Solução**: Verifique se o arquivo de configuração do Cognito está correto e as credenciais AWS estão disponíveis:

```bash
aws configure
```

### Problema: Timeout em testes

**Solução**: Aumente o timeout no arquivo `jest.config.ts`:

```typescript
testTimeout: 10000
```

### Problema: Erro ao fazer zip para deploy

**Solução**: Verifique se o diretório `zips/` existe:

```bash
mkdir -p zips
npm run deploy-prep
```

## 📚 Arquivos Importantes

- [package.json](./package.json) - Dependências e scripts
- [serverless.yml](./serverless.yml) - Configuração infraestrutura
- [tsconfig.json](./tsconfig.json) - Configuração TypeScript
- [jest.config.ts](./jest.config.ts) - Configuração testes

## 📝 Scripts NPM

| Script | Descrição |
|--------|-----------|
| `build` | Compila TypeScript com esbuild |
| `zip` | Cria arquivos ZIP para deploy |
| `deploy-prep` | Build + ZIP (preparação para deploy) |
| `offline` | Executa serviço localmente com LocalStack |
| `test` | Executa testes uma vez |
| `test:watch` | Executa testes em modo watch |
| `test:coverage` | Gera relatório de cobertura |

## 🤝 Contribuindo

Ao contribuir para este serviço:

1. Execute testes antes de fazer commit
2. Mantenha a cobertura de testes acima de 80%
3. Siga o estilo de código existente
4. Documente novas funcionalidades

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação oficial: [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- Documentação Cognito: [AWS Cognito](https://docs.aws.amazon.com/cognito/)
- Serverless Framework: [serverless.com](https://www.serverless.com/)

---

**Versão**: 1.0.0  
**Última atualização**: Março 2026
