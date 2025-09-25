// App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SellerLogin from "./components/SellerLogin";
import SellerRegistration from "./components/SellerRegistration";
import Dashboard from "./components/SellerDashboard"; // ✅ import your new dashboard
import MerchantOrders from "./components/MerchantOrders";

// Protect Seller routes
function ProtectedSeller({ children }) {
  const token = localStorage.getItem("sellerToken");
  if (!token) {
    return <Navigate to="/seller/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/register" element={<SellerRegistration />} />
        <Route path="/merchant" element={<MerchantOrders />} />


        {/* ✅ Protected Seller Dashboard */}
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedSeller>
              <Dashboard />
            </ProtectedSeller>
          }
        />

        <Route path="*" element={<Navigate to="/seller/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
