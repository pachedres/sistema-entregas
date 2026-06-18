from dataclasses import dataclass

from app.domain.models.pedido import Pedido
from app.domain.ports.outbound.pedido_repository_port import IPedidoRepository
from app.domain.ports.outbound.event_publisher_port import IEventPublisher


@dataclass
class CriarPedidoCommand:
    cliente_nome: str
    endereco_entrega: str
    descricao: str


class CriarPedidoHandler:
    def __init__(self, repo: IPedidoRepository, publisher: IEventPublisher):
        self._repo = repo
        self._publisher = publisher

    async def handle(self, cmd: CriarPedidoCommand) -> Pedido:
        pedido = Pedido(
            cliente_nome=cmd.cliente_nome,
            endereco_entrega=cmd.endereco_entrega,
            descricao=cmd.descricao,
        )
        pedido = await self._repo.salvar(pedido)
        await self._publisher.publicar("PedidoCriado", {
            "id": str(pedido.id),
            "cliente_nome": pedido.cliente_nome,
            "endereco_entrega": pedido.endereco_entrega,
            "descricao": pedido.descricao,
            "status": pedido.status,
        })
        return pedido
