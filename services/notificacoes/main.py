import os
from contextlib import asynccontextmanager

import aio_pika
from fastapi import FastAPI

from app.infrastructure.api import router
from app.infrastructure.messaging.rabbitmq_consumer import start_consumer

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.store = []
    app.state.rabbitmq = await aio_pika.connect_robust(RABBITMQ_URL)
    await start_consumer(app.state.rabbitmq, app.state.store)
    yield
    await app.state.rabbitmq.close()


app = FastAPI(title="Serviço de Notificações", version="1.0.0", lifespan=lifespan)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "notificacoes"}
