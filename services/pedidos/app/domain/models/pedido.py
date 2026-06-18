from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4


class StatusPedido(str, Enum):
    PENDENTE = "PENDENTE"
    CONFIRMADO = "CONFIRMADO"
    EM_ENTREGA = "EM_ENTREGA"
    ENTREGUE = "ENTREGUE"
    CANCELADO = "CANCELADO"


@dataclass
class Pedido:
    cliente_nome: str
    endereco_entrega: str
    descricao: str
    id: UUID = field(default_factory=uuid4)
    status: StatusPedido = field(default=StatusPedido.PENDENTE)
    criado_em: datetime = field(default_factory=datetime.utcnow)
