import json

import aio_pika

from app.application.event_handlers.pedido_criado_handler import PedidoCriadoHandler
from app.infrastructure.database import AsyncSessionLocal
from app.infrastructure.database.entrega_repository import EntregaRepository


async def start_consumer(connection: aio_pika.Connection) -> None:
    channel = await connection.channel()
    exchange = await channel.declare_exchange(
        "PedidoCriado", aio_pika.ExchangeType.FANOUT, durable=True
    )
    queue = await channel.declare_queue("entregas.pedido_criado", durable=True)
    await queue.bind(exchange)

    async def on_message(message: aio_pika.IncomingMessage) -> None:
        async with message.process():
            dados = json.loads(message.body)
            async with AsyncSessionLocal() as session:
                handler = PedidoCriadoHandler(EntregaRepository(session))
                entrega = await handler.handle(dados)
                print(f"[entregas] Entrega {entrega.id} criada para pedido {dados['id']}")

    await queue.consume(on_message)
    print("[entregas] Consumer PedidoCriado aguardando mensagens...")
