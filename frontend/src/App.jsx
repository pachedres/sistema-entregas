import React from "react";
import Entregas from "./screens/EntregasCard";
import "./styles.css";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Sistema de Entregas e Pedidos</h1>
      </header>
      <Entregas />
    </div>
  );
}
