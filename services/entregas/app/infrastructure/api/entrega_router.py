from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.domain.models.entrega import Entrega, StatusEntrega
from app.application.commands.iniciar_entrega import IniciarEntregaCommand, IniciarEntregaHandler
from app.application.commands.finalizar_entrega import FinalizarEntregaCommand, FinalizarEntregaHandler
from app.application.queries.buscar_entrega import BuscarEntregaQuery, BuscarEntregaHandler
from app.application.queries.listar_entregas import ListarEntregasHandler
from app.infrastructure.dependencies import (
    get_iniciar_handler,
    get_finalizar_handler,
    get_buscar_handler,
    get_listar_handler,
)

router = APIRouter(prefix="/entregas", tags=["entregas"])


class IniciarEntregaRequest(BaseModel):
    entregador_nome: str


class EntregaResponse(BaseModel):
    id: UUID
    pedido_id: UUID
    entregador_nome: str
    status: StatusEntrega
    criado_em: str

    @classmethod
    def from_domain(cls, entrega: Entrega) -> "EntregaResponse":
        return cls(
            id=entrega.id,
            pedido_id=entrega.pedido_id,
            entregador_nome=entrega.entregador_nome,
            status=entrega.status,
            criado_em=entrega.criado_em.isoformat(),
        )


@router.get("/", response_model=list[EntregaResponse])
async def listar_entregas(handler: ListarEntregasHandler = Depends(get_listar_handler)):
    entregas = await handler.handle()
    return [EntregaResponse.from_domain(e) for e in entregas]


@router.get("/{entrega_id}", response_model=EntregaResponse)
async def buscar_entrega(
    entrega_id: UUID,
    handler: BuscarEntregaHandler = Depends(get_buscar_handler),
):
    entrega = await handler.handle(BuscarEntregaQuery(id=entrega_id))
    if not entrega:
        raise HTTPException(status_code=404, detail="Entrega não encontrada")
    return EntregaResponse.from_domain(entrega)


@router.patch("/{entrega_id}/iniciar", response_model=EntregaResponse)
async def iniciar_entrega(
    entrega_id: UUID,
    body: IniciarEntregaRequest,
    handler: IniciarEntregaHandler = Depends(get_iniciar_handler),
):
    try:
        entrega = await handler.handle(
            IniciarEntregaCommand(entrega_id=entrega_id, entregador_nome=body.entregador_nome)
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return EntregaResponse.from_domain(entrega)


@router.patch("/{entrega_id}/finalizar", response_model=EntregaResponse)
async def finalizar_entrega(
    entrega_id: UUID,
    handler: FinalizarEntregaHandler = Depends(get_finalizar_handler),
):
    try:
        entrega = await handler.handle(FinalizarEntregaCommand(entrega_id=entrega_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return EntregaResponse.from_domain(entrega)
