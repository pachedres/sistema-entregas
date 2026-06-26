import { useState } from "react";
import "./styles.css";

export default function CriarPedidoComponent() {
  const [clienteNome, setClienteNome] = useState("");
  const [enderecoEntrega, setEnderecoEntrega] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleClienteNomeChange = (e) => setClienteNome(e.target.value);
  const handleEnderecoEntregaChange = (e) => setEnderecoEntrega(e.target.value);
  const handleDescricaoChange = (e) => setDescricao(e.target.value);

  const API_BASE = "http://localhost:8001";

  async function criarPedido(cliente_nome, endereco_entrega, descricao) {
    try {
      const res = await fetch(`${API_BASE}/pedidos/`, {
        body: JSON.stringify({ cliente_nome, endereco_entrega, descricao }),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setClienteNome("");
        setEnderecoEntrega("");
        setDescricao("");
        toast.success("Pedido criado com sucesso!");
      }
      if (!res.ok) {
        throw new Error("Falha ao criar pedido");
      }
      await fetchEntregas();
    } catch (err) {
      alert(err.message);
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault();
    criarPedido(clienteNome, enderecoEntrega, descricao);
  };

  return (
    <div className="criar-pedido">
      <h2>Criar Pedido</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cliente_nome">Nome do Cliente: </label>
          <input type="text" id="cliente_nome" name="cliente_nome" value={clienteNome} onChange={handleClienteNomeChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="endereco_entrega">Endereço de Entrega: </label>
          <input type="text" id="endereco_entrega" name="endereco_entrega" value={enderecoEntrega} onChange={handleEnderecoEntregaChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="descricao">Descrição: </label>
          <input type="text" id="descricao" name="descricao" value={descricao} onChange={handleDescricaoChange} required />
        </div>
        <div className="button-container">
          <button type="submit" className="btn-primary">Criar Pedido</button>
        </div>
      </form>
    </div>
  );
}
