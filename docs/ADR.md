# Architecture Decision Records — Sistema de Entregas

> Gabriel Fleck e Lucas Pacheco

---

## ADR-01 — Microsserviços como estilo arquitetural

**Título:** Adoção de microsserviços em vez de monolito

**Contexto:**
O sistema de logística possui quatro domínios claramente independentes: pedidos, entregas,
rastreamento e notificações. Cada domínio tem ciclo de vida, responsabilidade e ritmo de
mudança distintos. Um monolito agruparia toda essa lógica em um único processo, dificultando
a evolução e o escalonamento independente de cada parte.

**Decisão:**
Separar cada domínio em um microsserviço independente, com seu próprio processo, banco de
dados e imagem Docker. Os quatro serviços são: `pedidos`, `entregas`, `rastreamento` e
`notificacoes`.

**Consequências:**

| Ganhos | Abdicações |
|---|---|
| Cada serviço escala de forma independente | Complexidade operacional maior (múltiplos containers) |
| Falha em um serviço não derruba os outros | Necessidade de orquestração (Docker Compose / Kubernetes) |
| Times podem evoluir cada domínio separadamente | Comunicação entre serviços exige protocolo explícito |
| Banco de dados isolado por serviço (sem acoplamento de schema) | Transações distribuídas são mais difíceis de garantir |

---

## ADR-02 — Arquitetura Hexagonal (Ports & Adapters) para estrutura interna

**Título:** Uso de Arquitetura Hexagonal como padrão interno de cada microsserviço

**Contexto:**
Dentro de cada microsserviço era necessário definir como organizar o código para que a lógica
de negócio não ficasse acoplada ao framework web (FastAPI), ao banco de dados (SQLAlchemy/PostgreSQL)
ou ao broker de mensagens (RabbitMQ). Sem essa separação, trocar qualquer tecnologia de
infraestrutura exigiria alterar o código de domínio.

**Decisão:**
Adotar Arquitetura Hexagonal com três camadas em cada serviço:
- **Domain:** entidades e ports (interfaces abstratas) — zero dependência de frameworks
- **Application:** casos de uso que orquestram o domínio (com CQRS no serviço de pedidos)
- **Infrastructure:** adapters concretos (FastAPI, SQLAlchemy, aio-pika) que implementam os ports

**Consequências:**

| Ganhos | Abdicações |
|---|---|
| Domínio testável de forma isolada, sem banco ou broker | Mais arquivos e camadas para funcionalidades simples |
| Trocar PostgreSQL por outro banco não toca o domínio | Curva de aprendizado inicial maior |
| Trocar RabbitMQ por Kafka exige mudar apenas o adapter | Injeção de dependência manual (sem framework de DI) |
| Código alinhado com princípios SOLID | Overhead de criação de interfaces para cada porta |

---

## ADR-03 — RabbitMQ (AMQP) como padrão de comunicação assíncrona

**Título:** Uso de AMQP via RabbitMQ para comunicação entre microsserviços

**Contexto:**
Os microsserviços precisam se comunicar quando ocorrem eventos de negócio relevantes
(ex: um pedido criado deve disparar a criação de uma entrega). Chamadas REST síncronas
entre serviços criariam acoplamento temporal — se o serviço de entregas estivesse fora do ar,
a criação do pedido falharia junto. Era necessário um mecanismo assíncrono e desacoplado.

**Decisão:**
Adotar Event-Driven Architecture (EDA) com RabbitMQ como broker de mensagens usando o
protocolo AMQP. Cada evento de negócio é publicado em um exchange do tipo FANOUT, permitindo
que múltiplos serviços consumam o mesmo evento de forma independente. Os eventos definidos são:
`PedidoCriado`, `EntregaIniciada` e `EntregaFinalizada`.

**Consequências:**

| Ganhos | Abdicações |
|---|---|
| Serviços totalmente desacoplados — nenhum conhece o outro | Consistência eventual: o estado pode demorar milissegundos para propagar |
| Múltiplos consumers por evento sem alterar o publisher | RabbitMQ se torna ponto único de falha (SPOF) sem cluster |
| Resiliência: mensagens ficam na fila se o consumer estiver fora | Debugging mais complexo: fluxo não é linear |
| Permite escalar consumers independentemente | Necessidade de lidar com mensagens duplicadas (idempotência) |
