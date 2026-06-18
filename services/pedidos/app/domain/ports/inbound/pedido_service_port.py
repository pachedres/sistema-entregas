from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.models.pedido import Pedido, StatusPedido


class IPedidoService(ABC):
    @abstractmethod
    async def criar_pedido(self, cliente_nome: str, endereco_entrega: str, descricao: str) -> Pedido: ...

    @abstractmethod
    async def atualizar_status(self, id: UUID, status: StatusPedido) -> Pedido: ...

    @abstractmethod
    async def buscar_pedido(self, id: UUID) -> Pedido | None: ...

    @abstractmethod
    async def listar_pedidos(self) -> list[Pedido]: ...
