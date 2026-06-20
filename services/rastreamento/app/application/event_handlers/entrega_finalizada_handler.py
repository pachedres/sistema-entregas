from uuid import UUID

from app.domain.models.rastreamento import Rastreamento
from app.domain.ports.outbound.rastreamento_repository_port import IRastreamentoRepository


class EntregaFinalizadaHandler:
    def __init__(self, repo: IRastreamentoRepository):
        self._repo = repo

    async def handle(self, dados: dict) -> Rastreamento:
        rastreamento = Rastreamento(
            entrega_id=UUID(dados["id"]),
            pedido_id=UUID(dados["pedido_id"]),
            evento="EntregaFinalizada",
        )
        return await self._repo.salvar(rastreamento)
