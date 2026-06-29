from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class Notificacao:
    destinatario: str
    mensagem: str
    evento_origem: str
    pedido_id: str | None = None
    id: UUID = field(default_factory=uuid4)
    enviada_em: datetime = field(default_factory=datetime.utcnow)
