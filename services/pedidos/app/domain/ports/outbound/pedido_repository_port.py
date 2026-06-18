from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.models.pedido import Pedido


class IPedidoRepository(ABC):
    @abstractmethod
    async def salvar(self, pedido: Pedido) -> Pedido: ...

    @abstractmethod
    async def buscar_por_id(self, id: UUID) -> Pedido | None: ...

    @abstractmethod
    async def listar(self) -> list[Pedido]: ...

    @abstractmethod
    async def atualizar(self, pedido: Pedido) -> Pedido: ...
