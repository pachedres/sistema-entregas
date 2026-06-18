from dataclasses import dataclass
from uuid import UUID

from app.domain.models.entrega import Entrega
from app.domain.ports.outbound.entrega_repository_port import IEntregaRepository


@dataclass
class BuscarEntregaQuery:
    id: UUID


class BuscarEntregaHandler:
    def __init__(self, repo: IEntregaRepository):
        self._repo = repo

    async def handle(self, query: BuscarEntregaQuery) -> Entrega | None:
        return await self._repo.buscar_por_id(query.id)
