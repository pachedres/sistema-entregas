from uuid import UUID

from fastapi import APIRouter, Query, Request
from pydantic import BaseModel

router = APIRouter(prefix="/notificacoes", tags=["notificacoes"])


class NotificacaoResponse(BaseModel):
    id: UUID
    destinatario: str
    mensagem: str
    evento_origem: str
    enviada_em: str


@router.get("/", response_model=list[NotificacaoResponse])
async def listar_notificacoes(
    request: Request,
    pedido_id: UUID | None = Query(default=None),
):
    notificacoes = request.app.state.store

    if pedido_id is not None:
        notificacoes = [
            n for n in notificacoes if getattr(n, "pedido_id", None) == str(pedido_id)
        ]

    return [
        NotificacaoResponse(
            id=n.id,
            destinatario=n.destinatario,
            mensagem=n.mensagem,
            evento_origem=n.evento_origem,
            enviada_em=n.enviada_em.isoformat(),
        )
        for n in notificacoes
    ]
