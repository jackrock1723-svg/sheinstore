import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./SellerOrders.css"; // ✅ add CSS file

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const sellerId = localStorage.getItem("sellerId");

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/api/shipment/seller/${sellerId}`); // ✅ keep your working API
      setOrders(res.data);
    } catch (err) {
      console.error("❌ fetch seller orders error", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="orders-container">
      <h2 className="orders-title">📋 My Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Price</th>
            <th>Earn</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.orderId || o._id}</td>
              <td>{o.productTitle}</td>
              <td>₹{o.price}</td>
              <td>₹{o.earn}</td>
              <td>
                <span className={`status ${o.status}`}>{o.status}</span>
              </td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
