from uuid import UUID

from fastapi import APIRouter, Request
from pydantic import BaseModel
from fastapi import Response

from app.application.queries.listar_rastreamento import ListarRastreamentoHandler, ListarRastreamentoQuery
from app.infrastructure.repository.in_memory_repository import InMemoryRastreamentoRepository

router = APIRouter(prefix="/rastreamento", tags=["rastreamento"])


class RastreamentoResponse(BaseModel):
    id: UUID
    entrega_id: UUID
    pedido_id: UUID
    evento: str
    registrado_em: str


@router.get("/{entrega_id}", response_model=list[RastreamentoResponse])
async def listar_rastreamento(entrega_id: UUID, request: Request):
    repo = InMemoryRastreamentoRepository(request.app.state.store)
    handler = ListarRastreamentoHandler(repo)
    registros = await handler.handle(ListarRastreamentoQuery(entrega_id=entrega_id))
    return [
        RastreamentoResponse(
            id=r.id,
            entrega_id=r.entrega_id,
            pedido_id=r.pedido_id,
            evento=r.evento,
            registrado_em=r.registrado_em.isoformat(),
        )
        for r in registros
    ]


@router.api_route("/{entrega_id}", methods=["OPTIONS"])
async def rastreamento_options(entrega_id: UUID):
    return Response(status_code=200, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
    })
