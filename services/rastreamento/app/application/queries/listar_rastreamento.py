from dataclasses import dataclass
from uuid import UUID

from app.domain.models.rastreamento import Rastreamento
from app.domain.ports.outbound.rastreamento_repository_port import IRastreamentoRepository


@dataclass
class ListarRastreamentoQuery:
    entrega_id: UUID


class ListarRastreamentoHandler:
    def __init__(self, repo: IRastreamentoRepository):
        self._repo = repo

    async def handle(self, query: ListarRastreamentoQuery) -> list[Rastreamento]:
        return await self._repo.listar_por_entrega(query.entrega_id)
