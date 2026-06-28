import { useEffect, useRef, useState } from "react";
import EntregaItem from "../../components/EntregaItem";
import "./styles.css";
import CriarPedidoComponent from "../../components/CriarPedido";
import BuscarPedidoComponent from "../../components/BuscarPedido";
import BuscarEntrega from "../../components/BuscarEntrega";
import DashInfo from "../../components/DashInfo";
import {
  randomNames,
  randomAddresses,
  randomDescriptions,
  randomDeliverers,
} from "./RandomData";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8002";
const PEDIDOS_API_BASE = import.meta.env.VITE_API_PEDIDOS_BASE || "http://localhost:8001";
const SIMULATION_MIN_DELAY_MS = 5000;
const SIMULATION_MAX_DELAY_MS = 10000;

export default function Entregas() {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCriarPedidoForm, setShowCriarPedidoForm] = useState(false);
  const [showBuscarPedidoForm, setShowBuscarPedidoForm] = useState(false);
  const [showBuscarEntregaForm, setShowBuscarEntregaForm] = useState(false);
  const [simulationCount, setSimulationCount] = useState(10);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState("");
  const [showSimulationLog, setShowSimulationLog] = useState(false);
  const [continuousSimulationCount, setContinuousSimulationCount] = useState(10);
  const [isContinuousSimulationRunning, setIsContinuousSimulationRunning] = useState(false);
  const [continuousSimulationLog, setContinuousSimulationLog] = useState("");
  const [showContinuousSimulationLog, setShowContinuousSimulationLog] = useState(false);
  const isContinuousSimulationRef = useRef(false);

  async function fetchEntregas() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/entregas/`);
      if (!res.ok) throw new Error("Erro ao buscar entregas");
      const data = await res.json();
      data.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
      setEntregas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getRandomDelay = () =>
    Math.floor(
      SIMULATION_MIN_DELAY_MS +
        Math.random() * (SIMULATION_MAX_DELAY_MS - SIMULATION_MIN_DELAY_MS)
    );

  const randomItem = (items) =>
    items[Math.floor(Math.random() * items.length)];

  async function createPedido(pedidoData) {
    const res = await fetch(`${PEDIDOS_API_BASE}/pedidos/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedidoData),
    });
    if (!res.ok) {
      throw new Error("Falha ao criar pedido");
    }
    return await res.json();
  }

  async function refreshEntregas() {
    try {
      const res = await fetch(`${API_BASE}/entregas/`);
      if (!res.ok) throw new Error("Falha ao buscar entregas");
      const data = await res.json();
      data.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
      setEntregas(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function waitForEntregaByPedidoId(pedidoId, attempts = 20) {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const res = await fetch(`${API_BASE}/entregas/`);
      if (!res.ok) {
        throw new Error("Falha ao buscar entregas para rastrear");
      } 
      const data = await res.json();
      const entrega = data.find((item) => item.pedido_id === pedidoId);
      if (entrega) {
        return entrega;
      }
      await sleep(3000);
    }
    throw new Error("Entrega não encontrada para o pedido");
  }

  async function iniciarEntrega(entregaId, entregadorNome) {
    const res = await fetch(`${API_BASE}/entregas/${entregaId}/iniciar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entregador_nome: entregadorNome }),
    });
    if (!res.ok) {
      throw new Error("Falha ao iniciar entrega");
    }
    return await res.json();
  }

  async function finalizarEntrega(entregaId) {
    const res = await fetch(`${API_BASE}/entregas/${entregaId}/finalizar`, {
      method: "PATCH",
    });
    if (!res.ok) {
      throw new Error("Falha ao finalizar entrega");
    }
    return await res.json();
  }

  async function simulatePedido(index) {
    try {
      const delayBeforeCreate = getRandomDelay();
      setSimulationLog((prev) =>
        `${prev}\n[${index}/${simulationCount}] Aguardando ${Math.round(
          delayBeforeCreate / 1000
        )}s antes de criar o pedido...`
      );
      await sleep(delayBeforeCreate);

      const pedidoData = {
        cliente_nome: randomItem(randomNames),
        endereco_entrega: randomItem(randomAddresses),
        descricao: randomItem(randomDescriptions),
      };
      setSimulationLog((prev) =>
        `${prev}\n[${index}/${simulationCount}] Criando pedido para ${pedidoData.cliente_nome}`
      );
      const pedido = await createPedido(pedidoData);
      await refreshEntregas();

      setSimulationLog((prev) =>
        `${prev}\n[${index}/${simulationCount}] Pedido criado: ${pedido.id}`
      );
      setSimulationLog((prev) =>
        `${prev}\n[${index}/${simulationCount}] Buscando entrega para o pedido ${pedido.id}`
      );
      const entrega = await waitForEntregaByPedidoId(pedido.id);

      const delayBeforeStart = getRandomDelay();
      setSimulationLog((prev) =>
        `${prev}\n[${index}/${simulationCount}] Aguardando ${Math.round(
          delayBeforeStart / 1000
        )}s antes de iniciar a entrega...`
      );
      await sleep(delayBeforeStart);

      const entregador = randomItem(randomDeliverers);
      setSimulationLog((prev) =>
        `${prev}\n[${index}/${simulationCount}] Iniciando entrega ${entrega.id} com ${entregador}`
      );
      await iniciarEntrega(entrega.id, entregador);
      await refreshEntregas();

      const delayBeforeFinish = getRandomDelay();
      setSimulationLog((prev) =>
        `${prev}\n[${index}/${simulationCount}] Aguardando ${Math.round(
          delayBeforeFinish / 1000
        )}s antes de finalizar a entrega...`
      );
      await sleep(delayBeforeFinish);

      setSimulationLog((prev) =>
        `${prev}\n[${index}/${simulationCount}] Finalizando entrega ${entrega.id}`
      );
      await finalizarEntrega(entrega.id);
      await refreshEntregas();
    } catch (err) {
      setError(err.message);
      setSimulationLog((prev) => `${prev}\n[${index}/${simulationCount}] Erro: ${err.message}`);
    }
  }

  async function runSimulation() {
    setIsSimulating(true);
    setError(null);
    setSimulationLog("Iniciando simulação...\n");
    try {
      const tasks = Array.from({ length: simulationCount }, (_, idx) =>
        simulatePedido(idx + 1)
      );
      await Promise.all(tasks);
      setSimulationLog((prev) => `${prev}\nSimulação finalizada`);
    } catch (err) {
      setError(err.message);
      setSimulationLog((prev) => `${prev}\nErro global: ${err.message}`);
    } finally {
      setIsSimulating(false);
      await fetchEntregas();
    }
  }

  async function runContinuousSimulation() {
    if (isContinuousSimulationRunning) {
      isContinuousSimulationRef.current = false;
      setIsContinuousSimulationRunning(false);
      setContinuousSimulationLog((prev) => `${prev}\nSimulação contínua interrompida.`);
      return;
    }

    const pedidosPorSegundo = Math.max(1, Number(continuousSimulationCount) || 1);
    setIsContinuousSimulationRunning(true);
    isContinuousSimulationRef.current = true;
    setError(null);
    setContinuousSimulationLog(`Iniciando simulação contínua com ${pedidosPorSegundo} pedidos por segundo...\n`);
    setShowContinuousSimulationLog(true);

    try {
      let batchNumber = 1;
      while (isContinuousSimulationRef.current) {
        const batchStart = Date.now();
        const batchLogPrefix = `[Lote ${batchNumber}]`;
        setContinuousSimulationLog((prev) => `${prev}\n${batchLogPrefix} Processando ${pedidosPorSegundo} pedidos simultâneos...`);

        const batchTasks = Array.from({ length: pedidosPorSegundo }, (_, idx) =>
          (async () => {
            const cycleIndex = idx + 1;
            const delayBeforeCreate = getRandomDelay();
            setContinuousSimulationLog((prev) =>
              `${prev}\n${batchLogPrefix} [Pedido ${cycleIndex}] Aguardando ${Math.round(
                delayBeforeCreate / 1000
              )}s antes de criar...`
            );
            await sleep(delayBeforeCreate);

            if (!isContinuousSimulationRef.current) {
              return;
            }

            const pedidoData = {
              cliente_nome: randomItem(randomNames),
              endereco_entrega: randomItem(randomAddresses),
              descricao: randomItem(randomDescriptions),
            };
            setContinuousSimulationLog((prev) =>
              `${prev}\n${batchLogPrefix} [Pedido ${cycleIndex}] Criando pedido para ${pedidoData.cliente_nome}`
            );
            const pedido = await createPedido(pedidoData);
            await refreshEntregas();

            setContinuousSimulationLog((prev) =>
              `${prev}\n${batchLogPrefix} [Pedido ${cycleIndex}] Pedido criado: ${pedido.id}`
            );
            const entrega = await waitForEntregaByPedidoId(pedido.id);

            const delayBeforeStart = getRandomDelay();
            setContinuousSimulationLog((prev) =>
              `${prev}\n${batchLogPrefix} [Pedido ${cycleIndex}] Aguardando ${Math.round(
                delayBeforeStart / 1000
              )}s antes de iniciar...`
            );
            await sleep(delayBeforeStart);

            if (!isContinuousSimulationRef.current) {
              return;
            }

            const entregador = randomItem(randomDeliverers);
            setContinuousSimulationLog((prev) =>
              `${prev}\n${batchLogPrefix} [Pedido ${cycleIndex}] Iniciando entrega ${entrega.id} com ${entregador}`
            );
            await iniciarEntrega(entrega.id, entregador);
            await refreshEntregas();

            const delayBeforeFinish = getRandomDelay();
            setContinuousSimulationLog((prev) =>
              `${prev}\n${batchLogPrefix} [Pedido ${cycleIndex}] Aguardando ${Math.round(
                delayBeforeFinish / 1000
              )}s antes de finalizar...`
            );
            await sleep(delayBeforeFinish);

            if (!isContinuousSimulationRef.current) {
              return;
            }

            setContinuousSimulationLog((prev) =>
              `${prev}\n${batchLogPrefix} [Pedido ${cycleIndex}] Finalizando entrega ${entrega.id}`
            );
            await finalizarEntrega(entrega.id);
            await refreshEntregas();
          })()
        );

        await Promise.all(batchTasks);
        batchNumber += 1;
        const elapsed = Date.now() - batchStart;
        const baseDelayMs = 200;
        const jitterMs = Math.floor(Math.random() * 400) + 200;
        const nextDelay = Math.max(400, baseDelayMs + jitterMs - elapsed);
        if (!isContinuousSimulationRef.current) {
          break;
        }
        setContinuousSimulationLog((prev) => `${prev}\n${batchLogPrefix} Lote concluído. Próximo lote em ${Math.round(nextDelay / 1000)}s.`);
        await sleep(nextDelay);
      }
    } catch (err) {
      setError(err.message);
      setContinuousSimulationLog((prev) => `${prev}\nErro na simulação contínua: ${err.message}`);
    } finally {
      if (!isContinuousSimulationRef.current) {
        setContinuousSimulationLog((prev) => `${prev}\nSimulação contínua interrompida.`);
      }
      isContinuousSimulationRef.current = false;
      setIsContinuousSimulationRunning(false);
      await fetchEntregas();
    }
  }

  useEffect(() => {
    fetchEntregas();
    return () => {
      isContinuousSimulationRef.current = false;
    };
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

  const toggleLog = () => {
    setShowSimulationLog((prev) => !prev);
  };

  const toggleContinuousLog = () => {
    setShowContinuousSimulationLog((prev) => !prev);
  };

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

      <div className="simulation-panel">
        <div className="simulation-input-group">
          <label htmlFor="simulationCount">Pedidos na simulação</label>
          <input
            id="simulationCount"
            type="number"
            min="1"
            value={simulationCount}
            onChange={(event) =>
              setSimulationCount(Number(event.target.value) || 1)
            }
            disabled={isSimulating}
          />
        </div>
        <button
          className="btn-simulation"
          type="button"
          onClick={runSimulation}
          disabled={isSimulating || isContinuousSimulationRunning}
        >
          {isSimulating ? "Simulação em andamento..." : "Iniciar simulação"}
        </button>
        <button
          className="btn-primary"
          type="button"
          onClick={toggleLog}
          disabled={!simulationLog}
        >
          {showSimulationLog ? "Ocultar log" : "Log de eventos"}
        </button>
      </div>
      {showSimulationLog && simulationLog && (
        <div className="simulation-log">
          <h3>Log de eventos da simulação:</h3>
          <pre>{simulationLog}</pre>
        </div>
      )}

      <div className="simulation-panel">
        <div className="simulation-input-group">
          <label htmlFor="continuousSimulationCount">Pedidos da simulação contínua</label>
          <input
            id="continuousSimulationCount"
            type="number"
            min="1"
            value={continuousSimulationCount}
            onChange={(event) =>
              setContinuousSimulationCount(Number(event.target.value) || 1)
            }
            disabled={isContinuousSimulationRunning || isSimulating}
          />
        </div>
        <button
          className="btn-simulation"
          type="button"
          onClick={runContinuousSimulation}
          disabled={isSimulating}
        >
          {isContinuousSimulationRunning
            ? "Parar simulação contínua"
            : "Iniciar simulação contínua"}
        </button>
        <button
          className="btn-primary"
          type="button"
          onClick={toggleContinuousLog}
          disabled={!continuousSimulationLog}
        >
          {showContinuousSimulationLog ? "Ocultar log contínuo" : "Log contínuo"}
        </button>
      </div>
      {showContinuousSimulationLog && continuousSimulationLog && (
        <div className="simulation-log">
          <h3>Log de eventos da simulação contínua:</h3>
          <pre>{continuousSimulationLog}</pre>
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
