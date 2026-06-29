import { useEffect, useState } from "react";
import "./styles.css";

const API_RASTREAMENTO_BASE = import.meta.env.VITE_RASTREAMENTO_API_BASE || "http://localhost:8003";
const API_NOTIFICACOES_BASE = import.meta.env.VITE_NOTIFICACOES_API_BASE || "http://localhost:8004";

export default function EntregaItem({ entrega, onIniciar, onFinalizar }) {
  const [entregador, setEntregador] = useState("");
  const [ultimoEvento, setUltimoEvento] = useState("");
  const [ultimaNotificacao, setUltimaNotificacao] = useState("");

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const [rastreamentoRes, notificacoesRes] = await Promise.all([
          fetch(`${API_RASTREAMENTO_BASE}/rastreamento/${entrega.id}`),
          fetch(`${API_NOTIFICACOES_BASE}/notificacoes/?pedido_id=${entrega.pedido_id}`),
        ]);

        if (rastreamentoRes.ok) {
          const rastreamento = await rastreamentoRes.json();
          if (Array.isArray(rastreamento) && rastreamento.length > 0) {
            const eventoMaisRecente = [...rastreamento].sort(
              (a, b) => new Date(b.registrado_em) - new Date(a.registrado_em)
            )[0];
            setUltimoEvento(eventoMaisRecente?.evento || "Nenhum evento registrado");
          } else {
            setUltimoEvento("Nenhum evento registrado");
          }
        }

        if (notificacoesRes.ok) {
          const notificacoes = await notificacoesRes.json();
          if (Array.isArray(notificacoes) && notificacoes.length > 0) {
            const ultima = [...notificacoes].sort(
              (a, b) => new Date(b.enviada_em) - new Date(a.enviada_em)
            )[0];
            setUltimaNotificacao(ultima?.mensagem || "Nenhuma notificação registrada");
          } else {
            setUltimaNotificacao("Nenhuma notificação registrada");
          }
        }
      } catch (err) {
        console.error(err);
        setUltimoEvento("Não disponível");
        setUltimaNotificacao("Não disponível");
      }
    };

    carregarResumo();
  }, [entrega.id, entrega.status]);

  console.log("EntregaItem - entrega:", entrega);

  return (
    <div className={`entrega-item ${entrega.status === 'ENTREGUE' ? 'entrega-finalizada' : entrega.status === 'EM_ENTREGA' ? 'entrega-em-entrega' : ''}`}>
      <div className="info">
        <div>
          <strong>ID do Pedido:</strong> {entrega.pedido_id}
        </div>
        <div>
          <strong>ID do Entrega:</strong> {entrega.id}
        </div>
        <div>
          <strong>Status:</strong> <span className={`status ${entrega.status}`}>{entrega.status}</span>
        </div>
        <div>
          <strong>Entregador:</strong> {entrega.entregador_nome || "Não atribuído"}
        </div>
        <div>
          <strong>Último evento:</strong> {ultimoEvento}
        </div>
        <div>
          <strong>Última notificação:</strong> {ultimaNotificacao}
        </div>
      </div>
      <div className="actions">
        {!entrega.entregador_nome && (
          <input
            placeholder="Nome do entregador"
            value={entregador}
            onChange={(e) => setEntregador(e.target.value)}
          />
        )}
        {entrega.status === 'AGUARDANDO' && (
          <button
            disabled={!entregador}
            className="btn-iniciar"
            onClick={() => onIniciar(entrega.id, entregador)}
          >
            Iniciar
          </button>
        )}
        {entrega.status === 'EM_ENTREGA' && (
          <button
            className="btn-finalizar"
            onClick={() => onFinalizar(entrega.id)}
          >
            Finalizar
          </button>
        )}
      </div>
    </div>
  );
}
