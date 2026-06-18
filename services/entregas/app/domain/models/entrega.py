from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4


class StatusEntrega(str, Enum):
    AGUARDANDO = "AGUARDANDO"
    EM_ENTREGA = "EM_ENTREGA"
    ENTREGUE = "ENTREGUE"
    CANCELADA = "CANCELADA"


@dataclass
class Entrega:
    pedido_id: UUID
    id: UUID = field(default_factory=uuid4)
    entregador_nome: str = ""
    status: StatusEntrega = field(default=StatusEntrega.AGUARDANDO)
    criado_em: datetime = field(default_factory=datetime.utcnow)
