import json

import aio_pika

from app.application.event_handlers.pedido_criado_handler import PedidoCriadoHandler
from app.application.event_handlers.entrega_iniciada_handler import EntregaIniciadaHandler
from app.application.event_handlers.entrega_finalizada_handler import EntregaFinalizadaHandler


async def start_consumer(connection: aio_pika.Connection, store: list) -> None:
    channel = await connection.channel()

    # PedidoCriado
    ex_pedido = await channel.declare_exchange("PedidoCriado", aio_pika.ExchangeType.FANOUT, durable=True)
    q_pedido = await channel.declare_queue("notificacoes.pedido_criado", durable=True)
    await q_pedido.bind(ex_pedido)

    async def on_pedido_criado(message: aio_pika.IncomingMessage) -> None:
        async with message.process():
            await PedidoCriadoHandler(store).handle(json.loads(message.body))

    await q_pedido.consume(on_pedido_criado)

    # EntregaIniciada
    ex_iniciada = await channel.declare_exchange("EntregaIniciada", aio_pika.ExchangeType.FANOUT, durable=True)
    q_iniciada = await channel.declare_queue("notificacoes.entrega_iniciada", durable=True)
    await q_iniciada.bind(ex_iniciada)

    async def on_entrega_iniciada(message: aio_pika.IncomingMessage) -> None:
        async with message.process():
            await EntregaIniciadaHandler(store).handle(json.loads(message.body))

    await q_iniciada.consume(on_entrega_iniciada)

    # EntregaFinalizada
    ex_finalizada = await channel.declare_exchange("EntregaFinalizada", aio_pika.ExchangeType.FANOUT, durable=True)
    q_finalizada = await channel.declare_queue("notificacoes.entrega_finalizada", durable=True)
    await q_finalizada.bind(ex_finalizada)

    async def on_entrega_finalizada(message: aio_pika.IncomingMessage) -> None:
        async with message.process():
            await EntregaFinalizadaHandler(store).handle(json.loads(message.body))

    await q_finalizada.consume(on_entrega_finalizada)

    print("[notificacoes] Consumers aguardando mensagens...")
