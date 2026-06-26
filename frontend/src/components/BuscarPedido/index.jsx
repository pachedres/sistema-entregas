import { useState, useEffect } from "react";
import "./styles.css";

export default function BuscarPedidoComponent() {
  const [pedidoId, setPedidoId] = useState("");
  const [pedido, setPedido] = useState(null);

  const handlePedidoIdChange = (e) => {
      setPedidoId(e.target.value);
  } 
  
  const API_BASE = "http://localhost:8001";

  const buscarPedido = async (pedido_id) => {
    try {
      const res = await fetch(`${API_BASE}/pedidos/${pedido_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Falha ao buscar pedido");
      }
      return await res.json();
    } catch (err) {
      alert(err.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = await buscarPedido(pedidoId);
    setPedido(data);
  };
  
  console.log("Pedido:", pedido);

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
      <h2>Buscar Pedido</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="pedido_id">ID do Pedido: </label>
          <input type="text" id="pedido_id" name="pedido_id" value={pedidoId} onChange={handlePedidoIdChange} required />
        </div>
        <div className="button-container">
          <button type="submit" className="btn-primary">Buscar Pedido</button>
        </div>
      </form>
      <div>
        {pedido && (
          <div className="pedido-info">
            <h3>Informações do Pedido</h3>
            <p><strong>ID:</strong> {pedido.id}</p>
            <p><strong>Cliente:</strong> {pedido.cliente_nome}</p>
            <p><strong>Endereço de entrega:</strong> {pedido.endereco_entrega}</p>
            <p><strong>Descrição:</strong> {pedido.descricao}</p>
            <p><strong>Status:</strong> {pedido.status}</p>
            <p><strong>Criado em:</strong> {formatDate(pedido.criado_em)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
