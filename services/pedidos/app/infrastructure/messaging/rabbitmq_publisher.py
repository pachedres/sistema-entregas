import json

import aio_pika

from app.domain.ports.outbound.event_publisher_port import IEventPublisher


class RabbitMQPublisher(IEventPublisher):
    def __init__(self, connection: aio_pika.Connection):
        self._connection = connection

    async def publicar(self, evento: str, dados: dict) -> None:
        async with self._connection.channel() as channel:
            exchange = await channel.declare_exchange(
                evento, aio_pika.ExchangeType.FANOUT, durable=True
            )
            await exchange.publish(
                aio_pika.Message(
                    body=json.dumps(dados, default=str).encode(),
                    content_type="application/json",
                ),
                routing_key="",
            )
