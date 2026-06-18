import json

import aio_pika

from app.application.event_handlers.entrega_iniciada_handler import EntregaIniciadaHandler
from app.application.event_handlers.entrega_finalizada_handler import EntregaFinalizadaHandler
from app.infrastructure.database import AsyncSessionLocal
from app.infrastructure.database.pedido_repository import PedidoRepository


async def start_consumer(connection: aio_pika.Connection) -> None:
    channel = await connection.channel()

    # Consome EntregaIniciada → atualiza pedido para EM_ENTREGA
    exchange_iniciada = await channel.declare_exchange(
        "EntregaIniciada", aio_pika.ExchangeType.FANOUT, durable=True
    )
    queue_iniciada = await channel.declare_queue("pedidos.entrega_iniciada", durable=True)
    await queue_iniciada.bind(exchange_iniciada)

    async def on_entrega_iniciada(message: aio_pika.IncomingMessage) -> None:
        async with message.process():
            dados = json.loads(message.body)
            async with AsyncSessionLocal() as session:
                await EntregaIniciadaHandler(PedidoRepository(session)).handle(dados)

    await queue_iniciada.consume(on_entrega_iniciada)

    # Consome EntregaFinalizada → atualiza pedido para ENTREGUE
    exchange_finalizada = await channel.declare_exchange(
        "EntregaFinalizada", aio_pika.ExchangeType.FANOUT, durable=True
    )
    queue_finalizada = await channel.declare_queue("pedidos.entrega_finalizada", durable=True)
    await queue_finalizada.bind(exchange_finalizada)

    async def on_entrega_finalizada(message: aio_pika.IncomingMessage) -> None:
        async with message.process():
            dados = json.loads(message.body)
            async with AsyncSessionLocal() as session:
                await EntregaFinalizadaHandler(PedidoRepository(session)).handle(dados)

    await queue_finalizada.consume(on_entrega_finalizada)

    print("[pedidos] Consumers EntregaIniciada e EntregaFinalizada aguardando mensagens...")
