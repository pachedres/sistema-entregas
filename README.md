# Sistema de Entregas

Este projeto contém um sistema de entregas com microsserviços em Python e um frontend em React + Vite.

## Pré-requisitos

- Docker Desktop instalado e em execução
- Node.js e npm instalados

## Passo a passo para iniciar

### 1. Iniciar os serviços com Docker Desktop

No diretório raiz do projeto, execute:

```bash
docker-compose up --build
```

Isso irá iniciar:

- RabbitMQ (`http://localhost:15672`)
- Postgres para `pedidos` (`5432`) e `entregas` (`5433`)
- Serviço de pedidos em `http://localhost:8001`
- Serviço de entregas em `http://localhost:8002`
- Serviço de rastreamento em `http://localhost:8003`
- Serviço de notificações em `http://localhost:8004`

> Aguarde até que os containers estejam prontos antes de abrir o frontend.

### 2. Configurar o frontend

No diretório `frontend`, verifique o arquivo `.env` e confirme que ele aponta para o backend de entregas:

```env
VITE_API_BASE=http://localhost:8002
```

### 3. Instalar dependências do frontend

```bash
cd frontend
npm install
```

### 4. Executar o frontend

```bash
npm run dev
```

### 5. Abrir o sistema no navegador

- Frontend: `http://localhost:5173`
- API de entregas: `http://localhost:8002/entregas/`
- RabbitMQ UI: `http://localhost:15672`
- Documentação do serviço de entregas: `http://localhost:8002/docs`
- Documentação do serviço de pedidos: `http://localhost:8001/docs`

## Como criar uma entrega via Swagger/OpenAPI

As entregas são criadas indiretamente quando um pedido é criado. Siga os passos abaixo:

### Passo 1: Criar um pedido

1. Acesse `http://localhost:8001/docs` (Swagger do serviço de pedidos)
2. Clique em **POST /pedidos/**
3. Clique em **Try it out**
4. Preencha o JSON com os dados do pedido:

```json
{
  "cliente_nome": "João Silva",
  "endereco_entrega": "Rua das Flores, 123",
  "descricao": "Entrega de remédio"
}
```

5. Clique em **Execute**
6. O servidor irá retornar um pedido com um `id`. Guarde esse ID.

### Passo 2: Visualizar a entrega criada

1. Acesse `http://localhost:8002/docs` (Swagger do serviço de entregas)
2. Clique em **GET /entregas/**
3. Clique em **Try it out**
4. Clique em **Execute**

Você verá a lista de entregas, incluindo a que foi criada automaticamente pelo pedido.

### Passo 3: Gerenciar a entrega

No Swagger de entregas (`http://localhost:8002/docs`), você verá os seguintes endpoints:

#### GET /entregas/
- **Função**: Listar todas as entregas
- **Como usar**: Clique em **Try it out** → **Execute**
- **Retorno**: Lista de todas as entregas com ID, status, entregador, etc.

#### GET /entregas/{entrega_id}
- **Função**: Buscar uma entrega específica pelo ID
- **Como usar**: 
  1. Clique em **Try it out**
  2. Insira o `entrega_id` (UUID da entrega)
  3. Clique em **Execute**
- **Retorno**: Dados completos da entrega

#### PATCH /entregas/{entrega_id}/iniciar
- **Função**: Iniciar uma entrega (registrar o entregador)
- **Como usar**:
  1. Clique em **Try it out**
  2. Insira o `entrega_id`
  3. No campo de corpo (JSON), preencha:
     ```json
     {
       "entregador_nome": "João Silva"
     }
     ```
  4. Clique em **Execute**
- **Retorno**: Entrega com status `em_entrega` e nome do entregador

#### PATCH /entregas/{entrega_id}/finalizar
- **Função**: Finalizar uma entrega
- **Como usar**:
  1. Clique em **Try it out**
  2. Insira o `entrega_id`
  3. Clique em **Execute**
- **Retorno**: Entrega com status `entregue`

## Observações

- O frontend consome os endpoints do backend usando a variável `VITE_API_BASE`.
- Se o backend estiver em outra porta ou host, ajuste `frontend/.env` e reinicie o Vite.
- Atualmente o frontend roda localmente com Vite; o Docker Compose inicia apenas os serviços de backend.
