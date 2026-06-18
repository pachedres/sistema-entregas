from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import AsyncSessionLocal
from app.infrastructure.database.pedido_repository import PedidoRepository
from app.infrastructure.messaging.rabbitmq_publisher import RabbitMQPublisher
from app.application.commands.criar_pedido import CriarPedidoHandler
from app.application.commands.atualizar_status import AtualizarStatusHandler
from app.application.queries.buscar_pedido import BuscarPedidoHandler
from app.application.queries.listar_pedidos import ListarPedidosHandler


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


def get_rabbitmq(request: Request):
    return request.app.state.rabbitmq


async def get_criar_handler(
    session: AsyncSession = Depends(get_db),
    conn=Depends(get_rabbitmq),
) -> CriarPedidoHandler:
    return CriarPedidoHandler(PedidoRepository(session), RabbitMQPublisher(conn))


async def get_atualizar_handler(
    session: AsyncSession = Depends(get_db),
    conn=Depends(get_rabbitmq),
) -> AtualizarStatusHandler:
    return AtualizarStatusHandler(PedidoRepository(session), RabbitMQPublisher(conn))


async def get_buscar_handler(
    session: AsyncSession = Depends(get_db),
) -> BuscarPedidoHandler:
    return BuscarPedidoHandler(PedidoRepository(session))


async def get_listar_handler(
    session: AsyncSession = Depends(get_db),
) -> ListarPedidosHandler:
    return ListarPedidosHandler(PedidoRepository(session))
