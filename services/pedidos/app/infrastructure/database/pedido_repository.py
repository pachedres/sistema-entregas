from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.pedido import Pedido, StatusPedido
from app.domain.ports.outbound.pedido_repository_port import IPedidoRepository
from app.infrastructure.database.models import PedidoModel


class PedidoRepository(IPedidoRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_domain(self, model: PedidoModel) -> Pedido:
        return Pedido(
            id=model.id,
            cliente_nome=model.cliente_nome,
            endereco_entrega=model.endereco_entrega,
            descricao=model.descricao,
            status=StatusPedido(model.status),
            criado_em=model.criado_em,
        )

    async def salvar(self, pedido: Pedido) -> Pedido:
        model = PedidoModel(
            id=pedido.id,
            cliente_nome=pedido.cliente_nome,
            endereco_entrega=pedido.endereco_entrega,
            descricao=pedido.descricao,
            status=pedido.status.value,
            criado_em=pedido.criado_em,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_domain(model)

    async def buscar_por_id(self, id: UUID) -> Pedido | None:
        result = await self._session.execute(
            select(PedidoModel).where(PedidoModel.id == id)
        )
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    async def listar(self) -> list[Pedido]:
        result = await self._session.execute(select(PedidoModel))
        return [self._to_domain(m) for m in result.scalars().all()]

    async def atualizar(self, pedido: Pedido) -> Pedido:
        result = await self._session.execute(
            select(PedidoModel).where(PedidoModel.id == pedido.id)
        )
        model = result.scalar_one_or_none()
        model.status = pedido.status.value
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_domain(model)
