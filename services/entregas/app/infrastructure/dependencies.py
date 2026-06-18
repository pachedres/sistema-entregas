from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import AsyncSessionLocal
from app.infrastructure.database.entrega_repository import EntregaRepository
from app.infrastructure.messaging.rabbitmq_publisher import RabbitMQPublisher
from app.application.commands.iniciar_entrega import IniciarEntregaHandler
from app.application.commands.finalizar_entrega import FinalizarEntregaHandler
from app.application.queries.buscar_entrega import BuscarEntregaHandler
from app.application.queries.listar_entregas import ListarEntregasHandler


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


def get_rabbitmq(request: Request):
    return request.app.state.rabbitmq


async def get_iniciar_handler(
    session: AsyncSession = Depends(get_db),
    conn=Depends(get_rabbitmq),
) -> IniciarEntregaHandler:
    return IniciarEntregaHandler(EntregaRepository(session), RabbitMQPublisher(conn))


async def get_finalizar_handler(
    session: AsyncSession = Depends(get_db),
    conn=Depends(get_rabbitmq),
) -> FinalizarEntregaHandler:
    return FinalizarEntregaHandler(EntregaRepository(session), RabbitMQPublisher(conn))


async def get_buscar_handler(
    session: AsyncSession = Depends(get_db),
) -> BuscarEntregaHandler:
    return BuscarEntregaHandler(EntregaRepository(session))


async def get_listar_handler(
    session: AsyncSession = Depends(get_db),
) -> ListarEntregasHandler:
    return ListarEntregasHandler(EntregaRepository(session))
