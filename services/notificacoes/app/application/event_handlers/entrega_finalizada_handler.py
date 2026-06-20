from app.domain.models.notificacao import Notificacao


class EntregaFinalizadaHandler:
    def __init__(self, store: list):
        self._store = store

    async def handle(self, dados: dict) -> Notificacao:
        notificacao = Notificacao(
            destinatario="cliente",
            mensagem="Seu pedido foi entregue! Obrigado por usar nosso sistema.",
            evento_origem="EntregaFinalizada",
        )
        self._store.append(notificacao)
        print(f"[notificacoes] NOTIFICAÇÃO → {notificacao.destinatario}: {notificacao.mensagem}")
        return notificacao
