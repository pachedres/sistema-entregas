from dataclasses import dataclass
from uuid import UUID

from app.domain.models.entrega import Entrega, StatusEntrega
from app.domain.ports.outbound.entrega_repository_port import IEntregaRepository
from app.domain.ports.outbound.event_publisher_port import IEventPublisher


@dataclass
class IniciarEntregaCommand:
    entrega_id: UUID
    entregador_nome: str


class IniciarEntregaHandler:
    def __init__(self, repo: IEntregaRepository, publisher: IEventPublisher):
        self._repo = repo
        self._publisher = publisher

    async def handle(self, cmd: IniciarEntregaCommand) -> Entrega:
        entrega = await self._repo.buscar_por_id(cmd.entrega_id)
        if not entrega:
            raise ValueError(f"Entrega {cmd.entrega_id} não encontrada")
        entrega.status = StatusEntrega.EM_ENTREGA
        entrega.entregador_nome = cmd.entregador_nome
        entrega = await self._repo.atualizar(entrega)
        await self._publisher.publicar("EntregaIniciada", {
            "id": str(entrega.id),
            "pedido_id": str(entrega.pedido_id),
            "entregador_nome": entrega.entregador_nome,
        })
        return entrega
