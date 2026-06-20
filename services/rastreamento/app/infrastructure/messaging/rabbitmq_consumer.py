import json

import aio_pika

from app.application.event_handlers.entrega_iniciada_handler import EntregaIniciadaHandler
from app.application.event_handlers.entrega_finalizada_handler import EntregaFinalizadaHandler
from app.infrastructure.repository.in_memory_repository import InMemoryRastreamentoRepository


async def start_consumer(connection: aio_pika.Connection, store: list) -> None:
    channel = await connection.channel()

    exchange_iniciada = await channel.declare_exchange(
        "EntregaIniciada", aio_pika.ExchangeType.FANOUT, durable=True
    )
    queue_iniciada = await channel.declare_queue("rastreamento.entrega_iniciada", durable=True)
    await queue_iniciada.bind(exchange_iniciada)

    async def on_entrega_iniciada(message: aio_pika.IncomingMessage) -> None:
        async with message.process():
            dados = json.loads(message.body)
            repo = InMemoryRastreamentoRepository(store)
            rastreamento = await EntregaIniciadaHandler(repo).handle(dados)
            print(f"[rastreamento] Registrado: {rastreamento.evento} para entrega {rastreamento.entrega_id}")

    await queue_iniciada.consume(on_entrega_iniciada)

    exchange_finalizada = await channel.declare_exchange(
        "EntregaFinalizada", aio_pika.ExchangeType.FANOUT, durable=True
    )
    queue_finalizada = await channel.declare_queue("rastreamento.entrega_finalizada", durable=True)
    await queue_finalizada.bind(exchange_finalizada)

    async def on_entrega_finalizada(message: aio_pika.IncomingMessage) -> None:
        async with message.process():
            dados = json.loads(message.body)
            repo = InMemoryRastreamentoRepository(store)
            rastreamento = await EntregaFinalizadaHandler(repo).handle(dados)
            print(f"[rastreamento] Registrado: {rastreamento.evento} para entrega {rastreamento.entrega_id}")

    await queue_finalizada.consume(on_entrega_finalizada)

    print("[rastreamento] Consumers aguardando mensagens...")
