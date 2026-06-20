from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.models.rastreamento import Rastreamento


class IRastreamentoRepository(ABC):
    @abstractmethod
    async def salvar(self, rastreamento: Rastreamento) -> Rastreamento: ...

    @abstractmethod
    async def listar_por_entrega(self, entrega_id: UUID) -> list[Rastreamento]: ...

    @abstractmethod
    async def listar_todos(self) -> list[Rastreamento]: ...
