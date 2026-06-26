import { useState } from "react";
import "./styles.css";

export default function EntregaItem({ entrega, onIniciar, onFinalizar }) {
  const [entregador, setEntregador] = useState("");

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
