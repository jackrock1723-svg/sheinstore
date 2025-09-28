import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { FaTruck, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import "./AdminOrders.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ price: "", earn: "", status: "" });

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/admin/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("❌ fetch orders error", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEdit = (order) => {
    setEditing(order._id);
    setForm({ price: order.price, earn: order.earn, status: order.status });
  };

  const handleSave = async (id) => {
    try {
      await api.put(`/api/admin/orders/${id}`, form);
      setEditing(null);
      fetchOrders();
    } catch (err) {
      console.error("❌ update order error", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await api.delete(`/api/admin/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("❌ delete order error", err);
    }
  };

  return (
    <div className="admin-orders">
      <h2>
        <FaTruck /> Orders
      </h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Seller</th>
            <th>Product</th>
            <th>Price</th>
            <th>Earn</th>
            <th>Status</th>
            <th>Created</th>
            <th>Proof</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.orderId || o._id}</td>
              <td>{o.sellerId?.name || "Unknown"}</td>
              <td>{o.productTitle}</td>

              <td>
                {editing === o._id ? (
                  <input
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                ) : (
                  `₹${o.price}`
                )}
              </td>
              <td>
                {editing === o._id ? (
                  <input
                    value={form.earn}
                    onChange={(e) =>
                      setForm({ ...form, earn: e.target.value })
                    }
                  />
                ) : (
                  `₹${o.earn}`
                )}
              </td>
              <td>
                {editing === o._id ? (
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="payment_pending">Payment Pending</option>
                    <option value="payment_verified">Payment Verified</option>
                    <option value="shipped">Shipped</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <span className={`status ${o.status}`}>{o.status}</span>
                )}
              </td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td>
  {o.payment?.screenshotUrl ? (
    <button
      onClick={async () => {
        try {
          const filename = o.payment.screenshotUrl.split("/").pop();

          const res = await api.get(`/api/admin/proofs/${filename}`, {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`, // ✅ send token
            },
          });

          const fileURL = window.URL.createObjectURL(res.data);
          const imgWindow = window.open();
          imgWindow.document.write(
            `<img src="${fileURL}" style="max-width:100%;"/>`
          );
        } catch (err) {
          console.error("❌ proof fetch error", err);
          alert("Failed to load proof (check permissions or file path).");
        }
      }}
    >
      View
    </button>
  ) : (
    "—"
  )}
</td>







              <td>
                {editing === o._id ? (
                  <>
                    <button
                      className="btn-save"
                      onClick={() => handleSave(o._id)}
                    >
                      <FaSave /> Save
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => setEditing(null)}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(o)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(o._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
