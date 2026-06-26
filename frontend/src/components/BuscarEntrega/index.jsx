import { useState, useEffect } from "react";
import "./styles.css";

export default function BuscarEntregaComponent() {
  const [entregaId, setEntregaId] = useState("");
  const [entrega, setEntrega] = useState(null);

  const handleEntregaIdChange = (e) => {
      setEntregaId(e.target.value);
  } 
  
  const API_BASE = "http://localhost:8002";

  const buscarEntrega = async (entrega_id) => {
    try {
      const res = await fetch(`${API_BASE}/entregas/${entrega_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Falha ao buscar entrega");
      }
      return await res.json();
    } catch (err) {
      alert(err.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = await buscarEntrega(entregaId);
    setEntrega(data);
  };
  
  console.log("Entrega:", entrega);
  console.log("Entrega ID:", entregaId);

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
            <p><strong>Nome do entregador:</strong> {entrega.entregador_nome}</p>
            <p><strong>Status:</strong> {entrega.status}</p>
            <p><strong>Criado em:</strong> {formatDate(entrega.criado_em)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
