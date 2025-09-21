// src/components/OrderCard.jsx
import React from "react";
import "./merchant.css";

export default function OrderCard({ order, onRequest }) {
  const price = Number(order.price) || 0;
  const earnAmount = price ? (price * (Math.floor(Math.random() * 20) + 10)) / 100 : 0;

  return (
    <div className="order-card" role="article">
      <div className="order-image-wrapper">
        <img
          src={order.image || "/placeholder.png"}
          alt={order.productName || order.title || "product"}
          className="order-image"
          loading="lazy"
        />
      </div>

      <div className="order-info">
        <h3 className="order-title">{order.productName || order.title}</h3>

        <div className="order-meta-row">
          <div className="order-price">💲 {price.toFixed(2)}</div>
          <div className="order-earn">
            <span className="earn-tag">Earn</span> 💰 {earnAmount.toFixed(2)}
          </div>
        </div>

        <button className="request-btn" onClick={() => onRequest(order)}>
          Request Shipment
        </button>
      </div>
    </div>
  );
}
