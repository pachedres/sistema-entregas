from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.entrega import Entrega, StatusEntrega
from app.domain.ports.outbound.entrega_repository_port import IEntregaRepository
from app.infrastructure.database.models import EntregaModel


class EntregaRepository(IEntregaRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_domain(self, model: EntregaModel) -> Entrega:
        return Entrega(
            id=model.id,
            pedido_id=model.pedido_id,
            entregador_nome=model.entregador_nome,
            status=StatusEntrega(model.status),
            criado_em=model.criado_em,
        )

    async def salvar(self, entrega: Entrega) -> Entrega:
        model = EntregaModel(
            id=entrega.id,
            pedido_id=entrega.pedido_id,
            entregador_nome=entrega.entregador_nome,
            status=entrega.status.value,
            criado_em=entrega.criado_em,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_domain(model)

    async def buscar_por_id(self, id: UUID) -> Entrega | None:
        result = await self._session.execute(
            select(EntregaModel).where(EntregaModel.id == id)
        )
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    async def listar(self) -> list[Entrega]:
        result = await self._session.execute(select(EntregaModel))
        return [self._to_domain(m) for m in result.scalars().all()]

    async def atualizar(self, entrega: Entrega) -> Entrega:
        result = await self._session.execute(
            select(EntregaModel).where(EntregaModel.id == entrega.id)
        )
        model = result.scalar_one_or_none()
        model.status = entrega.status.value
        model.entregador_nome = entrega.entregador_nome
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_domain(model)
