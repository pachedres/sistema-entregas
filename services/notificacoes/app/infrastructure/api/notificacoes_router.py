from uuid import UUID

from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter(prefix="/notificacoes", tags=["notificacoes"])


class NotificacaoResponse(BaseModel):
    id: UUID
    destinatario: str
    mensagem: str
    evento_origem: str
    enviada_em: str


@router.get("/", response_model=list[NotificacaoResponse])
async def listar_notificacoes(request: Request):
    return [
        NotificacaoResponse(
            id=n.id,
            destinatario=n.destinatario,
            mensagem=n.mensagem,
            evento_origem=n.evento_origem,
            enviada_em=n.enviada_em.isoformat(),
        )
        for n in request.app.state.store
    ]
