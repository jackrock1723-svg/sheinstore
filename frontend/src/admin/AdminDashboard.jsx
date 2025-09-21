// src/admin/AdminDashboard.jsx
import React from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import SellersPage from "./SellersPage";
import UsersPage from "./UsersPage";
import MerchantsPage from "./MerchantsPage";
import WalletsPage from "./WalletsPage";

export default function AdminDashboard() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#1e293b", color: "#fff", padding: 20 }}>
        <h2 style={{ marginBottom: 20 }}>Admin Panel</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <NavLink to="sellers" style={{ color: "#fff" }}>👨‍💼 Sellers</NavLink>
          <NavLink to="users" style={{ color: "#fff" }}>👥 Users</NavLink>
          <NavLink to="merchants" style={{ color: "#fff" }}>🛒 Merchants</NavLink>
          <NavLink to="wallets" style={{ color: "#fff" }}>💰 Wallets</NavLink>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 20 }}>
        <h1>Welcome Admin 👋</h1>
        <Routes>
          <Route path="sellers" element={<SellersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="merchants" element={<MerchantsPage />} />
          <Route path="wallets" element={<WalletsPage />} />
          <Route path="*" element={<div>Select a section from the sidebar</div>} />
        </Routes>
      </div>
    </div>
  );
}
