from uuid import UUID

from app.domain.models.entrega import Entrega
from app.domain.ports.outbound.entrega_repository_port import IEntregaRepository


class PedidoCriadoHandler:
    def __init__(self, repo: IEntregaRepository):
        self._repo = repo

    async def handle(self, dados: dict) -> Entrega:
        entrega = Entrega(pedido_id=UUID(dados["id"]))
        return await self._repo.salvar(entrega)
