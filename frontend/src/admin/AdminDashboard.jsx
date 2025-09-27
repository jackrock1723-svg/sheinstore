// src/admin/AdminDashboard.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 220,
          background: "#1e293b",
          color: "#fff",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ marginBottom: 20 }}>Admin Panel</h2>
          {/* Sidebar */}
<nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
  <NavLink to="/admin/dashboard/sellers" style={{ color: "#fff" }}>
    👨‍💼 Sellers
  </NavLink>
  <NavLink to="/admin/dashboard/users" style={{ color: "#fff" }}>
    👥 Users
  </NavLink>
  <NavLink to="/admin/dashboard/merchants" style={{ color: "#fff" }}>
    🛒 Merchants
  </NavLink>
  <NavLink to="/admin/dashboard/wallets" style={{ color: "#fff" }}>
    💰 Wallets
  </NavLink>
  <NavLink to="/admin/dashboard/withdrawals" style={{ color: "#fff" }}>
    💸 Withdrawals
  </NavLink>
</nav>

        </div>

        <button
          onClick={handleLogout}
          style={{
            marginTop: 20,
            background: "#ef4444",
            color: "#fff",
            border: "none",
            padding: "10px 15px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 20 }}>
        <h1>Welcome Admin 👋</h1>
        <Outlet /> {/* ✅ Nested routes render here */}
      </div>
    </div>
  );
}
