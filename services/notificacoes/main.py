from fastapi import FastAPI
from app.infrastructure.api import router

app = FastAPI(title="Serviço de Notificações", version="1.0.0")

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "notificacoes"}
