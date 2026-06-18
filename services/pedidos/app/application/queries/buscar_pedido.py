from dataclasses import dataclass
from uuid import UUID

from app.domain.models.pedido import Pedido
from app.domain.ports.outbound.pedido_repository_port import IPedidoRepository


@dataclass
class BuscarPedidoQuery:
    id: UUID


class BuscarPedidoHandler:
    def __init__(self, repo: IPedidoRepository):
        self._repo = repo

    async def handle(self, query: BuscarPedidoQuery) -> Pedido | None:
        return await self._repo.buscar_por_id(query.id)
