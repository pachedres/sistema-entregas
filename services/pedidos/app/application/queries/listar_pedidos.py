from app.domain.models.pedido import Pedido
from app.domain.ports.outbound.pedido_repository_port import IPedidoRepository


class ListarPedidosHandler:
    def __init__(self, repo: IPedidoRepository):
        self._repo = repo

    async def handle(self) -> list[Pedido]:
        return await self._repo.listar()
