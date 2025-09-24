import React from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import MerchantOrders from "./components/MerchantOrders";
import WalletPage from "./components/WalletPage";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import "./App.css";
import SellerRegistration from "./components/SellerRegistration";
import "./components/SellerRegistration.css";
import SellerLogin from "./components/SellerLogin";

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
        {/* Navigation Bar (hide on /seller/register) */}
        <Routes>
          <Route
            path="/seller/register"
            element={<SellerRegistration />}
          />
          <Route
            path="*"
            element={
              <>
                <nav className="navbar">
                  <div className="nav-logo">Seller Portal</div>
                  <div className="nav-links">
                    <NavLink to="/" className="nav-link">🏠 Home</NavLink>
                    <NavLink to="/merchant" className="nav-link">🛒 Merchant</NavLink>
                    <NavLink to="/wallet" className="nav-link">💰 Wallet</NavLink>
                    <NavLink to="/admin" className="nav-link">🔧 Admin</NavLink>
                  </div>
                </nav>

                <div className="page-content">
                  <Routes>
                    <Route path="/" element={<div>Home</div>} />
                    <Route path="/merchant" element={<MerchantOrders />} />
                    <Route path="/wallet" element={<WalletPage />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/seller/login" element={<SellerLogin />} />
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
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


export default App;
