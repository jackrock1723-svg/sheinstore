// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SellerLogin from "./components/SellerLogin";
import SellerRegistration from "./components/SellerRegistration";
import SellerDashboard from "./components/SellerDashboard";
import MerchantOrders from "./components/MerchantOrders";
import SellerWallet from "./components/SellerWallet";

import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import SellersPage from "./admin/SellersPage";
import UsersPage from "./admin/UsersPage";
import MerchantsPage from "./admin/MerchantsPage";
import WalletsPage from "./admin/WalletsPage";
import AdminWithdrawals from "./admin/AdminWithdrawals";

// ✅ Generic Protected Route
function ProtectedRoute({ children, roleRequired }) {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");

  if (!token) {
    return (
      <Navigate
        to={roleRequired === "admin" ? "/admin/login" : "/seller/login"}
        replace
      />
    );
  }

  if (role !== roleRequired) {
    return (
      <Navigate
        to={role === "admin" ? "/admin/dashboard" : "/seller/dashboard"}
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------------- Seller Routes ---------------- */}
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/register" element={<SellerRegistration />} />

        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute roleRequired="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/merchant"
          element={
            <ProtectedRoute roleRequired="seller">
              <MerchantOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute roleRequired="seller">
              <SellerWallet sellerId={localStorage.getItem("sellerId")} />
            </ProtectedRoute>
          }
        />

        {/* ---------------- Admin Routes ---------------- */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard/*"
          element={
            <ProtectedRoute roleRequired="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          {/* ✅ Nested Admin Routes */}
          <Route path="sellers" element={<SellersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="merchants" element={<MerchantsPage />} />
          <Route path="wallets" element={<WalletsPage />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
        </Route>

        {/* ---------------- Default Fallback ---------------- */}
        <Route path="*" element={<Navigate to="/seller/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
