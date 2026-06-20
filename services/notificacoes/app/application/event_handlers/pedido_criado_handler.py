from app.domain.models.notificacao import Notificacao


class PedidoCriadoHandler:
    def __init__(self, store: list):
        self._store = store

    async def handle(self, dados: dict) -> Notificacao:
        notificacao = Notificacao(
            destinatario=dados["cliente_nome"],
            mensagem=f"Seu pedido foi recebido e está sendo processado. Endereço: {dados['endereco_entrega']}",
            evento_origem="PedidoCriado",
        )
        self._store.append(notificacao)
        print(f"[notificacoes] NOTIFICAÇÃO → {notificacao.destinatario}: {notificacao.mensagem}")
        return notificacao
