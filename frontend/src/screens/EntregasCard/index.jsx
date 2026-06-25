import { useEffect, useState } from "react";
import EntregaItem from "../../components/EntregaItem";
import "./styles.css";
import CriarPedidoComponent from "../../components/CriarPedido";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8002";

export default function Entregas() {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCriarPedidoForm, setShowCriarPedidoForm] = useState(false);

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
      if (!res.ok) {
        throw new Error("Falha ao iniciar entrega");
      }
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
      if (!res.ok) {
        throw new Error("Falha ao finalizar entrega");
      }
      await fetchEntregas();
    } catch (err) {
      alert(err.message);
    }
  }

  const renderCriarPedidoForm = () => {
    setShowCriarPedidoForm((prev) => !prev);
  };

  return (
    <div className="entregas-screen">
      <header className="header">
        <h1>Sistema de Entregas</h1>
        <p className="subtitle">Gerenciamento de entregas em tempo real</p>
      </header>

      <div className="controls-container">
        <button className="btn-primary" onClick={fetchEntregas}>
          Atualizar
        </button>
        <button className="btn-primary" onClick={renderCriarPedidoForm}>
          Criar pedido
        </button>
      </div>
      <div className="criar-pedido-container">
        {showCriarPedidoForm && <CriarPedidoComponent />}
      </div>

      {loading && <div className="loading">Carregando entregas...</div>}
      {error && <div className="error">⚠️ {error}</div>}

      <div className="entregas-list">
        {entregas.length === 0 && !loading ? (
          <div className="empty-state">
            <p>Nenhuma entrega encontrada.</p>
            <small>Crie um pedido para gerar entregas automaticamente.</small>
          </div>
        ) : (
          entregas.map((e) => (
            <EntregaItem
              key={e.id}
              entrega={e}
              onIniciar={iniciar}
              onFinalizar={finalizar}
            />
          ))
        )}
      </div>
    </div>
  );
}
