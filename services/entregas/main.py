import os
from contextlib import asynccontextmanager

import aio_pika
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.api import router
from app.infrastructure.database import engine
from app.infrastructure.database.models import Base
from app.infrastructure.messaging.rabbitmq_consumer import start_consumer

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    app.state.rabbitmq = await aio_pika.connect_robust(RABBITMQ_URL)
    await start_consumer(app.state.rabbitmq)
    yield
    await app.state.rabbitmq.close()


app = FastAPI(title="Serviço de Entregas", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "entregas"}
