import os
from contextlib import asynccontextmanager

import aio_pika
from fastapi import FastAPI

from app.infrastructure.api import router
from app.infrastructure.database import engine
from app.infrastructure.database.models import Base

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    app.state.rabbitmq = await aio_pika.connect_robust(RABBITMQ_URL)
    yield
    await app.state.rabbitmq.close()


app = FastAPI(title="Serviço de Pedidos", version="1.0.0", lifespan=lifespan)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "pedidos"}
