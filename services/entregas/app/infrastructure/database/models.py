from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase
import uuid


class Base(DeclarativeBase):
    pass


class EntregaModel(Base):
    __tablename__ = "entregas"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pedido_id = Column(PGUUID(as_uuid=True), nullable=False)
    entregador_nome = Column(String, nullable=False, default="")
    status = Column(String, nullable=False, default="AGUARDANDO")
    criado_em = Column(DateTime, nullable=False)
