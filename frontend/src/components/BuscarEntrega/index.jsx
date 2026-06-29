import { useState, useEffect } from "react";
import "./styles.css";

export default function BuscarEntregaComponent() {
  const [entregaId, setEntregaId] = useState("");
  const [entrega, setEntrega] = useState(null);
  const [rastreamento, setRastreamento] = useState([]);
  const [eventos, setEventos] = useState([]);

  const handleEntregaIdChange = (e) => {
      setEntregaId(e.target.value);
  } 
  
  const API_BASE = "http://localhost:8002";
  const API_RASTREAMENTO = "http://localhost:8003";
  const API_NOTIFICACAO = "http://localhost:8004";

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

  const buscarNotificacoes = async (pedidoId) => {
    try {
      const url = pedidoId
        ? `${API_NOTIFICACAO}/notificacoes/?pedido_id=${pedidoId}`
        : `${API_NOTIFICACAO}/notificacoes/`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Falha ao buscar notificações");
      }
      return await res.json();
    } catch (err) {
      alert(err.message);
      return [];
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

    const [rastreamentoData, notificacoesData] = await Promise.all([
      buscarRastreamento(entregaId),
      buscarNotificacoes(data?.pedido_id),
    ]);

    const rastreamentoLista = Array.isArray(rastreamentoData) ? rastreamentoData : [];
    const notificacoesLista = Array.isArray(notificacoesData) ? notificacoesData : [];

    const eventosMapa = new Map();

    const adicionarEvento = (item, tipo) => {
      const nomeEvento = (item.evento_origem || item.evento || "Evento").toLowerCase();
      const hora = item.enviada_em || item.registrado_em;
      const chave = `${nomeEvento}|${new Date(hora).toISOString().slice(0, 19)}`;

      if (!eventosMapa.has(chave)) {
        eventosMapa.set(chave, {
          tipo: tipo === "notificacao" ? "notificacao" : "evento",
          titulo: item.evento_origem || item.evento || "Evento",
          mensagem: tipo === "notificacao" ? item.mensagem || "Sem mensagem" : item.evento || "Evento",
          hora,
        });
        return;
      }

      const existente = eventosMapa.get(chave);
      if (tipo === "notificacao") {
        existente.tipo = "evento+notificacao";
        existente.mensagem = item.mensagem || existente.mensagem;
        existente.titulo = item.evento_origem || existente.titulo;
      }
    };

    rastreamentoLista.forEach((item) => adicionarEvento(item, "rastreamento"));
    notificacoesLista.forEach((item) => adicionarEvento(item, "notificacao"));

    const eventosCombinados = Array.from(eventosMapa.values()).sort(
      (a, b) => new Date(b.hora) - new Date(a.hora)
    );

    setRastreamento(rastreamentoLista);
    setEventos(eventosCombinados);
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
        {eventos.length > 0 && (
          <div className="rastreamento-info">
            <h3>Eventos disparados</h3>
            {eventos.map((item, index) => (
              <div key={`${item.tipo}-${index}`} className="rastreamento-item">
                <p className="info-item">
                  <strong>Evento:</strong> {item.titulo} <br />
                  <strong>Mensagem:</strong> {item.mensagem} <br />
                  <strong>Hora:</strong> {formatDate(item.hora)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
