from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.models.entrega import Entrega


class IEntregaRepository(ABC):
    @abstractmethod
    async def salvar(self, entrega: Entrega) -> Entrega: ...

    @abstractmethod
    async def buscar_por_id(self, id: UUID) -> Entrega | None: ...

    @abstractmethod
    async def listar(self) -> list[Entrega]: ...

    @abstractmethod
    async def atualizar(self, entrega: Entrega) -> Entrega: ...
