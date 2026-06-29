# Roteiro de Apresentação — Sistema de Entregas

> Gabriel Fleck e Lucas Pacheco

---

## 1. Arquiteto de Software
> *"Como o código está organizado por dentro?"*

**Foco:** estrutura interna, padrões, coesão, acoplamento e testabilidade.

### Arquitetura Hexagonal (Ports & Adapters)

Cada microsserviço é organizado em três camadas:

```
domain/          → entidades e interfaces (ports) — zero dependência externa
application/     → casos de uso que orquestram o domínio
infrastructure/  → adapters concretos (FastAPI, SQLAlchemy, RabbitMQ)
```

O núcleo do sistema (domínio) não importa nada de FastAPI, SQLAlchemy ou aio-pika.
Se amanhã o banco mudar de PostgreSQL para MongoDB, apenas o adapter de repositório
muda — o domínio e os casos de uso permanecem intactos.

**Exemplo concreto no serviço de Pedidos:**

```
Pedido (entidade de domínio)
  └── não conhece banco, não conhece HTTP, não conhece RabbitMQ

IPedidoRepository (port de saída)
  └── interface abstrata definida no domínio
  └── implementada por PedidoRepository (adapter SQLAlchemy) na infraestrutura

IEventPublisher (port de saída)
  └── interface abstrata definida no domínio
  └── implementada por RabbitMQPublisher na infraestrutura
```

### CQRS no Serviço de Pedidos

Separação explícita entre operações de escrita e leitura:

```
Commands (escrita)        Queries (leitura)
─────────────────         ────────────────
CriarPedidoCommand        BuscarPedidoQuery
AtualizarStatusCommand    ListarPedidosQuery
```

Cada command ou query tem seu próprio handler com responsabilidade única.
Commands publicam eventos após executar — queries são somente leitura, sem efeitos colaterais.

### Testabilidade

Por conta dos ports (interfaces), qualquer adapter pode ser substituído por um mock em testes.
O handler `CriarPedidoHandler` pode ser testado passando um repositório em memória e um
publisher fake — sem banco real, sem RabbitMQ real.

---

## 2. Arquiteto de Solução
> *"Como os componentes conversam entre si?"*

**Foco:** integração entre serviços, comunicação, infraestrutura e viabilidade técnica.

### Mapa de Comunicação

```
Cliente (HTTP/REST)
       │
       ▼
[pedidos :8001] ──── publica ────► RabbitMQ
       ▲                               │
       │ consome                       ├──► [entregas :8002] ──── publica ──► RabbitMQ
       │ EntregaIniciada               │         │                                │
       │ EntregaFinalizada             │         └──► consome PedidoCriado        │
       │                              │                                           │
       │                              ├──► [rastreamento :8003] ◄── consome ──────┤
       │                              │                                           │
       │                              └──► [notificacoes :8004] ◄── consome ──────┘
```

### Padrões de Comunicação Utilizados

| Padrão | Onde | Quando usar |
|---|---|---|
| REST (HTTP) | Cliente → Serviços | Operações síncronas, consultas |
| AMQP (RabbitMQ) | Entre serviços | Eventos assíncronos, desacoplamento |

### Exchanges e Filas RabbitMQ

| Exchange (FANOUT) | Publicado por | Consumido por |
|---|---|---|
| `PedidoCriado` | pedidos | entregas, notificacoes |
| `EntregaIniciada` | entregas | pedidos, rastreamento, notificacoes |
| `EntregaFinalizada` | entregas | pedidos, rastreamento, notificacoes |

O tipo **FANOUT** garante que todos os serviços inscritos recebem o evento — o publisher
não precisa saber quem está ouvindo.

### Infraestrutura (Docker Compose)

```
rabbitmq          → broker central de eventos (porta 5672, UI 15672)
postgres-pedidos  → banco exclusivo do serviço de pedidos (porta 5432)
postgres-entregas → banco exclusivo do serviço de entregas (porta 5433)
pedidos           → microsserviço (porta 8001)
entregas          → microsserviço (porta 8002)
rastreamento      → microsserviço em memória (porta 8003)
notificacoes      → microsserviço em memória (porta 8004)
```

Cada serviço com banco de dados possui seu próprio schema isolado — nenhum serviço
acessa o banco do outro diretamente (princípio Database per Service).

---

## 3. Arquiteto Enterprise
> *"Por que essa arquitetura faz sentido para a empresa?"*

**Foco:** alinhamento com o negócio, custo, escalabilidade estratégica, risco e governança.

### Alinhamento com o Negócio

O sistema de logística tem picos distintos em cada domínio:
- **Pedidos** → pico no momento da compra
- **Entregas** → pico no horário de despacho
- **Notificações** → pico contínuo ao longo do dia

Com microsserviços, é possível escalar apenas o serviço sobrecarregado, sem replicar
toda a aplicação. Isso reduz custo de infraestrutura em comparação a um monolito.

### Escalabilidade Estratégica

| Cenário | Como a arquitetura responde |
|---|---|
| Volume de pedidos dobra | Escalar apenas o container `pedidos` |
| Muitos entregadores simultâneos | Escalar apenas `entregas` e adicionar consumers RabbitMQ |
| Novo canal de notificação (WhatsApp) | Adicionar adapter no serviço `notificacoes` sem tocar os outros |
| Novo domínio (ex: pagamentos) | Criar novo microsserviço que consome `PedidoCriado` |

### Gestão de Risco

| Risco | Mitigação adotada |
|---|---|
| Falha no serviço de notificações | Outros serviços continuam operando normalmente |
| Falha no RabbitMQ | Ponto de atenção — exigiria cluster RabbitMQ em produção |
| Mudança de tecnologia de banco | Hexagonal isola o domínio do adapter de persistência |
| Evolução de um domínio | Times independentes por serviço, sem risco de conflito |

### Governança e Evolução

A combinação Hexagonal + EDA cria um sistema com **baixo acoplamento estrutural**:
nenhum serviço chama outro diretamente via HTTP. Isso permite que times diferentes
evoluam seus domínios sem coordenação constante, reduzindo o custo de manutenção
a longo prazo e acelerando o tempo de entrega de novas funcionalidades.
