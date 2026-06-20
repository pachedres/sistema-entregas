from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class Rastreamento:
    entrega_id: UUID
    pedido_id: UUID
    evento: str
    id: UUID = field(default_factory=uuid4)
    registrado_em: datetime = field(default_factory=datetime.utcnow)
