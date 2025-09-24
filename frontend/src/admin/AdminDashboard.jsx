// src/admin/AdminDashboard.jsx
import React from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import SellersPage from "./SellersPage";
import UsersPage from "./UsersPage";
import MerchantsPage from "./MerchantsPage";
import WalletsPage from "./WalletsPage";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login"); // redirect to login page
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
          <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Use absolute paths so they don't stack */}
            <NavLink to="/admin/sellers" style={{ color: "#fff" }}>
              👨‍💼 Sellers
            </NavLink>
            <NavLink to="/admin/users" style={{ color: "#fff" }}>
              👥 Users
            </NavLink>
            <NavLink to="/admin/merchants" style={{ color: "#fff" }}>
              🛒 Merchants
            </NavLink>
            <NavLink to="/admin/wallets" style={{ color: "#fff" }}>
              💰 Wallets
            </NavLink>
          </nav>
        </div>

        {/* Logout button at bottom */}
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
        <Routes>
          <Route path="sellers" element={<SellersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="merchants" element={<MerchantsPage />} />
          <Route path="wallets" element={<WalletsPage />} />
          <Route
            path="*"
            element={<div>Select a section from the sidebar</div>}
          />
        </Routes>
      </div>
    </div>
  );
}
