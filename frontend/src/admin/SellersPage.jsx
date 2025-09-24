// src/admin/SellersPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      // optionally redirect to admin login
      console.warn("No admin token found");
    }

    const fetchSellers = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/admin/sellers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSellers(res.data || []);
      } catch (err) {
        console.error("❌ fetch sellers error", err.response?.data || err.message);
        alert("Failed to load sellers: " + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, [token]);

  const handleAction = async (id, action) => {
    if (!token) {
      alert("Admin not logged in");
      return;
    }
    setBusyId(id);
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/admin/sellers/${id}/${action}`;
      const res = await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });

      // optimistic update
      setSellers(prev =>
        prev.map(s => (s._id === id ? { ...s, status: action === "approve" ? "approved" : "rejected" } : s))
      );

      alert(res.data?.message || `${action} successful`);
    } catch (err) {
      console.error(`❌ ${action} error`, err.response?.data || err.message);
      const msg = err.response?.data?.error || err.message || "Action failed";
      alert(`Failed to ${action}: ${msg}`);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p>Loading sellers...</p>;
  if (!sellers.length) return <p>No sellers found</p>;

  return (
    <div>
      <h2>Sellers</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Email</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Status</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((s) => (
            <tr key={s._id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{s.name}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{s.email}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{s.status}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                {s.status === "pending" ? (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button
                      disabled={busyId === s._id}
                      onClick={() => handleAction(s._id, "approve")}
                      style={{ background: "green", color: "#fff", padding: "6px 12px", border: "none", borderRadius: 4 }}
                    >
                      {busyId === s._id ? "..." : "✅ Approve"}
                    </button>
                    <button
                      disabled={busyId === s._id}
                      onClick={() => handleAction(s._id, "reject")}
                      style={{ background: "red", color: "#fff", padding: "6px 12px", border: "none", borderRadius: 4 }}
                    >
                      {busyId === s._id ? "..." : "❌ Reject"}
                    </button>
                  </div>
                ) : (
                  <span>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
