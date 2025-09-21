import React from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import MerchantOrders from "./components/MerchantOrders";
import WalletPage from "./components/WalletPage";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import "./App.css";

// Simple admin-protect wrapper: checks for admin token in localStorage
function ProtectedAdmin({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    // not logged in as admin → redirect to admin login
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div>
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="nav-logo">Seller Portal</div>
          <div className="nav-links">
            <NavLink to="/" className="nav-link">🏠 Home</NavLink>
            <NavLink to="/merchant" className="nav-link">🛒 Merchant</NavLink>
            <NavLink to="/wallet" className="nav-link">💰 Wallet</NavLink>
            {/* Optional admin link (visible to you) — remove if you don't want it in main nav */}
            <NavLink to="/admin" className="nav-link">🔧 Admin</NavLink>
          </div>
        </nav>

        {/* Routes */}
        <div className="page-content">
          <Routes>
            {/* Public / seller routes */}
            <Route path="/" element={<div>Home</div>} />
            <Route path="/merchant" element={<MerchantOrders />} />
            <Route path="/wallet" element={<WalletPage />} />

            {/* Admin authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected admin area (all admin subroutes handled inside AdminDashboard) */}
            <Route
              path="/admin/*"
              element={
                <ProtectedAdmin>
                  <AdminDashboard />
                </ProtectedAdmin>
              }
            />  
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
