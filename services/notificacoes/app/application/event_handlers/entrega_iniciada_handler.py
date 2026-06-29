from app.domain.models.notificacao import Notificacao


class EntregaIniciadaHandler:
    def __init__(self, store: list):
        self._store = store

    async def handle(self, dados: dict) -> Notificacao:
        notificacao = Notificacao(
            destinatario="cliente",
            mensagem=f"Seu pedido saiu para entrega com {dados['entregador_nome']}!",
            evento_origem="EntregaIniciada",
            pedido_id=dados.get("pedido_id"),
        )
        self._store.append(notificacao)
        print(f"[notificacoes] NOTIFICAÇÃO → {notificacao.destinatario}: {notificacao.mensagem}")
        return notificacao
