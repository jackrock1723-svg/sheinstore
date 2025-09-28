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

  const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: "4px",
  };

  const activeStyle = {
    background: "#334155",
    fontWeight: "bold",
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
            <NavLink
              to="/admin/dashboard/sellers"
              style={({ isActive }) =>
                isActive ? { ...linkStyle, ...activeStyle } : linkStyle
              }
            >
              👨‍💼 Sellers
            </NavLink>
            <NavLink
              to="/admin/dashboard/users"
              style={({ isActive }) =>
                isActive ? { ...linkStyle, ...activeStyle } : linkStyle
              }
            >
              👥 Users
            </NavLink>
            <NavLink
              to="/admin/dashboard/merchants"
              style={({ isActive }) =>
                isActive ? { ...linkStyle, ...activeStyle } : linkStyle
              }
            >
              🛒 Merchants
            </NavLink>
            <NavLink
              to="/admin/dashboard/wallets"
              style={({ isActive }) =>
                isActive ? { ...linkStyle, ...activeStyle } : linkStyle
              }
            >
              💰 Wallets
            </NavLink>
            <NavLink
              to="/admin/dashboard/withdrawals"
              style={({ isActive }) =>
                isActive ? { ...linkStyle, ...activeStyle } : linkStyle
              }
            >
              💸 Withdrawals
            </NavLink>
            <NavLink
              to="/admin/dashboard/orders"
              style={({ isActive }) =>
                isActive ? { ...linkStyle, ...activeStyle } : linkStyle
              }
            >
              📦 Orders
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
