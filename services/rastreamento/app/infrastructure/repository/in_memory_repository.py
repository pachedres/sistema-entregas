from uuid import UUID

from app.domain.models.rastreamento import Rastreamento
from app.domain.ports.outbound.rastreamento_repository_port import IRastreamentoRepository


class InMemoryRastreamentoRepository(IRastreamentoRepository):
    def __init__(self, store: list):
        self._store = store

    async def salvar(self, rastreamento: Rastreamento) -> Rastreamento:
        self._store.append(rastreamento)
        return rastreamento

    async def listar_por_entrega(self, entrega_id: UUID) -> list[Rastreamento]:
        return [r for r in self._store if r.entrega_id == entrega_id]

    async def listar_todos(self) -> list[Rastreamento]:
        return list(self._store)
