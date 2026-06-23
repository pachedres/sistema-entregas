import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8002";

function EntregaItem({ entrega, onIniciar, onFinalizar }) {
  const [entregador, setEntregador] = useState("");

  return (
    <div className="entrega">
      <div>
        <strong>Pedido:</strong> {entrega.pedido_id}
      </div>
      <div>
        <strong>Status:</strong> {entrega.status}
      </div>
      <div>
        <strong>Entregador:</strong> {entrega.entregador_nome || "-"}
      </div>
      <div className="actions">
        <input
          placeholder="Nome do entregador"
          value={entregador}
          onChange={(e) => setEntregador(e.target.value)}
        />
        <button onClick={() => onIniciar(entrega.id, entregador)}>Iniciar</button>
        <button onClick={() => onFinalizar(entrega.id)}>Finalizar</button>
      </div>
    </div>
  );
}

export default function App() {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchEntregas() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/entregas/`);
      if (!res.ok) throw new Error("Erro ao buscar entregas");
      const data = await res.json();
      setEntregas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntregas();
  }, []);

  async function iniciar(entregaId, entregadorNome) {
    if (!entregadorNome) {
      alert("Informe o nome do entregador");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/entregas/${entregaId}/iniciar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entregador_nome: entregadorNome }),
      });
      if (!res.ok) throw new Error("Falha ao iniciar entrega");
      await fetchEntregas();
    } catch (err) {
      alert(err.message);
    }
  }

  async function finalizar(entregaId) {
    try {
      const res = await fetch(`${API_BASE}/entregas/${entregaId}/finalizar`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Falha ao finalizar entrega");
      await fetchEntregas();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="container">
      <h1>Sistema de Entregas - Demo</h1>
      <div className="controls">
        <button onClick={fetchEntregas}>Atualizar</button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="error">{error}</p>}

      <div className="list">
        {entregas.map((e) => (
          <EntregaItem
            key={e.id}
            entrega={e}
            onIniciar={iniciar}
            onFinalizar={finalizar}
          />
        ))}
        {entregas.length === 0 && !loading && <p>Nenhuma entrega encontrada.</p>}
      </div>
    </div>
  );
}
