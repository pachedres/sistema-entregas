import { useState, useEffect } from "react";
import "./styles.css";

export default function BuscarEntregaComponent() {
  const [entregaId, setEntregaId] = useState("");
  const [entrega, setEntrega] = useState(null);
  const [rastreamento, setRastreamento] = useState([]);

  const handleEntregaIdChange = (e) => {
      setEntregaId(e.target.value);
  } 
  
  const API_BASE = "http://localhost:8002";
  const API_RASTREAMENTO = "http://localhost:8003";

  const buscarEntrega = async (entrega_id) => {
    try {
      const res = await fetch(`${API_BASE}/entregas/${entrega_id}`);
      if (!res.ok) {
        throw new Error("Falha ao buscar entrega");
      }
      return await res.json();
    } catch (err) {
      alert(err.message);
      return null;
    }
  };

  const buscarRastreamento = async (entrega_id) => {
    try {
      const res = await fetch(`${API_RASTREAMENTO}/rastreamento/${entrega_id}`);
      if (!res.ok) {
        throw new Error("Falha ao rastrear entrega");
      }
      return await res.json();
    } catch (err) {
      alert(err.message);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = await buscarEntrega(entregaId);
    setEntrega(data);
    
    const rastreamentoData = await buscarRastreamento(entregaId);
    setRastreamento(Array.isArray(rastreamentoData) ? rastreamentoData : []);
  };
  
const formatDate = (dateString) => {
  const date = new Date(dateString);

  date.setHours(date.getHours() - 3);

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};
  console.log(rastreamento);

  return (
    <div className="criar-pedido">
      <h2>Buscar Entrega</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="entrega_id">ID da Entrega: </label>
          <input type="text" id="entrega_id" name="entrega_id" value={entregaId} onChange={handleEntregaIdChange} required />
        </div>
        <div className="button-container">
          <button type="submit" className="btn-primary">Buscar Entrega</button>
        </div>
      </form>
      <div>
        {entrega && (
          <div className="entrega-info">
            <h3>Informações da Entrega</h3>
            <p><strong>Entrega ID:</strong> {entrega.id}</p>
            <p><strong>Pedido ID:</strong> {entrega.pedido_id}</p>
            <p><strong>Nome do entregador:</strong> {entrega.entregador_nome || 'Não atribuído'}</p>
            <p><strong>Status:</strong> {entrega.status}</p>
            <p><strong>Criado em:</strong> {formatDate(entrega.criado_em)}</p>
          </div>
        )}
        {rastreamento.length > 0 && (
          <div className="rastreamento-info">
            <h3>Rastreamento da Entrega</h3>
              {rastreamento.map((item, index) => (
                <div key={index} className="rastreamento-item">
                  <p key={index}>
                    <strong>Evento:</strong> {item.evento || "N/A"} <br />
                    <strong>Atualizado em:</strong> {formatDate(item.registrado_em)}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
