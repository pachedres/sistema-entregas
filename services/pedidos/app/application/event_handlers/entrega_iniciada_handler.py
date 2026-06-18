from uuid import UUID

from app.domain.models.pedido import StatusPedido
from app.domain.ports.outbound.pedido_repository_port import IPedidoRepository


class EntregaIniciadaHandler:
    def __init__(self, repo: IPedidoRepository):
        self._repo = repo

    async def handle(self, dados: dict) -> None:
        pedido_id = UUID(dados["pedido_id"])
        pedido = await self._repo.buscar_por_id(pedido_id)
        if pedido:
            pedido.status = StatusPedido.EM_ENTREGA
            await self._repo.atualizar(pedido)
            print(f"[pedidos] Pedido {pedido_id} atualizado para EM_ENTREGA")
