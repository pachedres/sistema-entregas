import { useEffect, useState } from "react";
import EntregaItem from "../../components/EntregaItem";
import "./styles.css";
import CriarPedidoComponent from "../../components/CriarPedido";
import BuscarPedidoComponent from "../../components/BuscarPedido";
import BuscarEntrega from "../../components/BuscarEntrega";
import DashInfo from "../../components/DashInfo";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8002";

export default function Entregas() {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCriarPedidoForm, setShowCriarPedidoForm] = useState(false);
  const [showBuscarPedidoForm, setShowBuscarPedidoForm] = useState(false);
  const [showBuscarEntregaForm, setShowBuscarEntregaForm] = useState(false);

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
    setShowBuscarPedidoForm(false);
    setShowBuscarEntregaForm(false);
    setShowCriarPedidoForm((prev) => !prev);
  };

  const renderBuscarPedidoForm = () => {
    setShowCriarPedidoForm(false);
    setShowBuscarEntregaForm(false);
    setShowBuscarPedidoForm((prev) => !prev);
  };

  const renderBuscarEntregaForm = () => {
    setShowCriarPedidoForm(false);
    setShowBuscarPedidoForm(false);
    setShowBuscarEntregaForm((prev) => !prev);
  };

  return (
    <div className="entregas-screen">
      <div className="controls-container">
        <button className="btn-primary" onClick={fetchEntregas}>
          Atualizar
        </button>
        <button className="btn-primary" onClick={renderCriarPedidoForm}>
          Criar pedido
        </button>
        <button className="btn-primary" onClick={renderBuscarPedidoForm}>
          Buscar pedido
        </button>
        <button className="btn-primary" onClick={renderBuscarEntregaForm}>
          Buscar entrega
        </button>
      </div>
      {showCriarPedidoForm && (
        <div className="criar-pedido-container">
          {<CriarPedidoComponent onPedidoCriado={fetchEntregas} />}
        </div>
      )}
      {showBuscarPedidoForm && (
        <div className="criar-pedido-container">
          {<BuscarPedidoComponent />}
        </div>
      )}
      {showBuscarEntregaForm && (
        <div className="criar-pedido-container">
          {<BuscarEntrega />}
        </div>
      )}

      {loading && <div className="loading">Carregando entregas...</div>}
      {error && <div className="error">⚠️ {error}</div>}

      <DashInfo
        aguardando={entregas.filter((e) => e.status === "AGUARDANDO").length}
        emEntrega={entregas.filter((e) => e.status === "EM_ENTREGA").length}
        entregue={entregas.filter((e) => e.status === "ENTREGUE").length}
      />

      <div className="entregas-list">
        <header className="header2">
          <h1>Entregas ativas</h1>
        </header>
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
