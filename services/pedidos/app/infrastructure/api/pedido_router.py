from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.domain.models.pedido import Pedido, StatusPedido
from app.application.commands.criar_pedido import CriarPedidoCommand, CriarPedidoHandler
from app.application.commands.atualizar_status import AtualizarStatusCommand, AtualizarStatusHandler
from app.application.queries.buscar_pedido import BuscarPedidoQuery, BuscarPedidoHandler
from app.application.queries.listar_pedidos import ListarPedidosHandler
from app.infrastructure.dependencies import (
    get_criar_handler,
    get_atualizar_handler,
    get_buscar_handler,
    get_listar_handler,
)

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


class CriarPedidoRequest(BaseModel):
    cliente_nome: str
    endereco_entrega: str
    descricao: str


class AtualizarStatusRequest(BaseModel):
    status: StatusPedido


class PedidoResponse(BaseModel):
    id: UUID
    cliente_nome: str
    endereco_entrega: str
    descricao: str
    status: StatusPedido
    criado_em: str

    @classmethod
    def from_domain(cls, pedido: Pedido) -> "PedidoResponse":
        return cls(
            id=pedido.id,
            cliente_nome=pedido.cliente_nome,
            endereco_entrega=pedido.endereco_entrega,
            descricao=pedido.descricao,
            status=pedido.status,
            criado_em=pedido.criado_em.isoformat(),
        )


@router.post("/", response_model=PedidoResponse, status_code=201)
async def criar_pedido(
    body: CriarPedidoRequest,
    handler: CriarPedidoHandler = Depends(get_criar_handler),
):
    pedido = await handler.handle(
        CriarPedidoCommand(
            cliente_nome=body.cliente_nome,
            endereco_entrega=body.endereco_entrega,
            descricao=body.descricao,
        )
    )
    return PedidoResponse.from_domain(pedido)


@router.get("/", response_model=list[PedidoResponse])
async def listar_pedidos(handler: ListarPedidosHandler = Depends(get_listar_handler)):
    pedidos = await handler.handle()
    return [PedidoResponse.from_domain(p) for p in pedidos]


@router.get("/{pedido_id}", response_model=PedidoResponse)
async def buscar_pedido(
    pedido_id: UUID,
    handler: BuscarPedidoHandler = Depends(get_buscar_handler),
):
    pedido = await handler.handle(BuscarPedidoQuery(id=pedido_id))
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return PedidoResponse.from_domain(pedido)


@router.patch("/{pedido_id}/status", response_model=PedidoResponse)
async def atualizar_status(
    pedido_id: UUID,
    body: AtualizarStatusRequest,
    handler: AtualizarStatusHandler = Depends(get_atualizar_handler),
):
    try:
        pedido = await handler.handle(
            AtualizarStatusCommand(id=pedido_id, status=body.status)
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return PedidoResponse.from_domain(pedido)
