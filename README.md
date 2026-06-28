# Sistema de Entregas

Este projeto implementa um exemplo de arquitetura orientada a microsserviços para gestão de pedidos e entregas, com um frontend em React + Vite e serviços backend em Python com FastAPI.

## Funcionalidades atuais

A aplicação possui os seguintes fluxos:

- Criar pedidos a partir do frontend ou via API
- Listar e buscar pedidos por ID
- Gerar entregas automaticamente a partir de pedidos criados
- Listar e buscar entregas por ID
- Iniciar e finalizar entregas
- Simular múltiplos pedidos e entregas em sequência
- Exibir uma interface com cards de entregas e painel de informações

## Arquitetura

O sistema é composto por:

- Frontend em React/Vite
- Serviço de pedidos em FastAPI
- Serviço de entregas em FastAPI
- Serviço de rastreamento em FastAPI
- Serviço de notificações em FastAPI
- RabbitMQ para eventos assíncronos
- PostgreSQL para persistência de pedidos e entregas

## Pré-requisitos

- Docker Desktop em execução
- Node.js e npm instalados

## Como executar

### 1. Subir os microsserviços

No diretório raiz do projeto, execute:

```bash
docker-compose up --build
```

Isso irá iniciar:

- RabbitMQ em http://localhost:15672
- PostgreSQL para pedidos na porta 5432
- PostgreSQL para entregas na porta 5433
- Serviço de pedidos em http://localhost:8001
- Serviço de entregas em http://localhost:8002
- Serviço de rastreamento em http://localhost:8003
- Serviço de notificações em http://localhost:8004

### 2. Configurar o frontend

No diretório frontend, crie ou ajuste o arquivo .env com as URLs dos serviços:

```env
VITE_API_BASE=http://localhost:8002
VITE_API_PEDIDOS_BASE=http://localhost:8001
```

### 3. Instalar dependências do frontend

```bash
cd frontend
npm install
```

### 4. Rodar o frontend

```bash
npm run dev
```

### 5. Acessar a aplicação

- Frontend: http://localhost:5173
- Swagger do serviço de pedidos: http://localhost:8001/docs
- Swagger do serviço de entregas: http://localhost:8002/docs
- Swagger do serviço de rastreamento: http://localhost:8003/docs
- Swagger do serviço de notificações: http://localhost:8004/docs

## Fluxo principal de uso

1. Acesse a interface no frontend.
2. Crie um pedido pelo formulário disponível.
3. O sistema gera automaticamente uma entrega associada ao pedido.
4. Na lista de entregas, você pode iniciar e finalizar o processo.
5. Também é possível buscar pedidos e entregas por ID diretamente pela interface.

## Endpoints principais

### Pedidos

- POST /pedidos/
- GET /pedidos/
- GET /pedidos/{pedido_id}
- PATCH /pedidos/{pedido_id}/status

### Entregas

- GET /entregas/
- GET /entregas/{entrega_id}
- PATCH /entregas/{entrega_id}/iniciar
- PATCH /entregas/{entrega_id}/finalizar

### Rastreamento

- GET /rastreamento/{entrega_id}

### Notificações

- GET /notificacoes/
