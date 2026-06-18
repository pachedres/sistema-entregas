from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase
import uuid


class Base(DeclarativeBase):
    pass


class PedidoModel(Base):
    __tablename__ = "pedidos"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cliente_nome = Column(String, nullable=False)
    endereco_entrega = Column(String, nullable=False)
    descricao = Column(String, nullable=False)
    status = Column(String, nullable=False, default="PENDENTE")
    criado_em = Column(DateTime, nullable=False)
