from app.domain.models.entrega import Entrega
from app.domain.ports.outbound.entrega_repository_port import IEntregaRepository


class ListarEntregasHandler:
    def __init__(self, repo: IEntregaRepository):
        self._repo = repo

    async def handle(self) -> list[Entrega]:
        return await self._repo.listar()
