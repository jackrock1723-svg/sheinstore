// src/admin/SellersPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // use the same auth key that AdminLogin sets:
  // localStorage.setItem("authToken", res.data.token);
  const getToken = () => localStorage.getItem("authToken");

  // centralised axios instance with auth header (optional)
  const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
    headers: { "Content-Type": "application/json" },
  });

  // helper to handle 401 -> force logout
  const handleUnauthorized = (msg = "Session expired. Please login again.") => {
    alert(msg);
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);
      const token = getToken();
      if (!token) {
        handleUnauthorized("No token found. Please login.");
        return;
      }

      try {
        const res = await api.get("/api/admin/sellers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSellers(res.data || []);
      } catch (err) {
        console.error("❌ fetch sellers error", err.response?.data || err.message);
        if (err.response?.status === 401) {
          handleUnauthorized(err.response?.data?.error || "Invalid or expired token");
        } else {
          alert("Failed to load sellers: " + (err.response?.data?.error || err.message));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (id, action) => {
    const token = getToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      await api.post(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/admin/sellers/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSellers((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: action === "approve" ? "approved" : "rejected" } : s))
      );
    } catch (err) {
      console.error(`❌ ${action} error`, err.response?.data || err.message);
      if (err.response?.status === 401) {
        handleUnauthorized(err.response?.data?.error || "Invalid or expired token");
      } else {
        alert(`Action failed: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  if (loading) return <p>Loading sellers...</p>;

  return (
    <div>
      <h2>Sellers</h2>
      {sellers.length === 0 ? (
        <p>No sellers found</p>
      ) : (
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
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => handleAction(s._id, "approve")}
                        style={{ background: "green", color: "#fff", padding: "6px 12px", borderRadius: 4 }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleAction(s._id, "reject")}
                        style={{ background: "red", color: "#fff", padding: "6px 12px", borderRadius: 4 }}
                      >
                        ❌ Reject
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
      )}
    </div>
  );
}
