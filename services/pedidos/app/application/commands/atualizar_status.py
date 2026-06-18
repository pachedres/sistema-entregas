from dataclasses import dataclass
from uuid import UUID

from app.domain.models.pedido import Pedido, StatusPedido
from app.domain.ports.outbound.pedido_repository_port import IPedidoRepository
from app.domain.ports.outbound.event_publisher_port import IEventPublisher


@dataclass
class AtualizarStatusCommand:
    id: UUID
    status: StatusPedido


class AtualizarStatusHandler:
    def __init__(self, repo: IPedidoRepository, publisher: IEventPublisher):
        self._repo = repo
        self._publisher = publisher

    async def handle(self, cmd: AtualizarStatusCommand) -> Pedido:
        pedido = await self._repo.buscar_por_id(cmd.id)
        if not pedido:
            raise ValueError(f"Pedido {cmd.id} não encontrado")
        pedido.status = cmd.status
        pedido = await self._repo.atualizar(pedido)
        await self._publisher.publicar("PedidoAtualizado", {
            "id": str(pedido.id),
            "status": pedido.status,
        })
        return pedido
