import React from "react";
import "./styles.css";

export default function DashInfo({ aguardando = 0, emEntrega = 0, entregue = 0 }) {
    return (
        <div className="dash-info-container">
            <h2 className="dash-info-title">Status das Entregas</h2>
            <div className="dash-info-items-container">
                <div className="item-aguardando-entregador dash-info-item">
                    <h3>Aguardando entregador</h3>
                    <h2 className="waiting">{aguardando}</h2>
                </div>
                <div className="item-em-entrega dash-info-item">
                    <h3>Em entrega</h3>
                    <h2 className="in-progress">{emEntrega}</h2>
                </div>
                <div className="item-entregue dash-info-item">
                    <h3>Entregue</h3>
                    <h2 className="completed">{entregue}</h2>
                </div>
            </div>
        </div>
    );

}