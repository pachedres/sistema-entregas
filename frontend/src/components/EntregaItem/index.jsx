import { useState } from "react";
import "./styles.css";

export default function EntregaItem({ entrega, onIniciar, onFinalizar }) {
  const [entregador, setEntregador] = useState("");

  return (
    <div className="entrega-item">
      <div className="info">
        <div>
          <strong>Pedido:</strong> {entrega.pedido_id}
        </div>
        <div>
          <strong>Status:</strong> <span className={`status ${entrega.status}`}>{entrega.status}</span>
        </div>
        <div>
          <strong>Entregador:</strong> {entrega.entregador_nome || "-"}
        </div>
      </div>
      <div className="actions">
        <input
          placeholder="Nome do entregador"
          value={entregador}
          onChange={(e) => setEntregador(e.target.value)}
        />
        <button 
          className="btn-iniciar"
          onClick={() => onIniciar(entrega.id, entregador)}
        >
          Iniciar
        </button>
        <button 
          className="btn-finalizar"
          onClick={() => onFinalizar(entrega.id)}
        >
          Finalizar
        </button>
      </div>
    </div>
  );
}
