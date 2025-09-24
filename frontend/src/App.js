import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
} from "react-router-dom";
import MerchantOrders from "./components/MerchantOrders";
import WalletPage from "./components/WalletPage";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import SellerRegistration from "./components/SellerRegistration";
import SellerLogin from "./components/SellerLogin";
import "./App.css";
import "./components/SellerRegistration.css";

// 🔐 Simple admin-protect wrapper
function ProtectedAdmin({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

// 🔧 Layout wrapper that hides navbar on certain routes
function Layout({ children }) {
  const location = useLocation();
  const hideNavbar =
    location.pathname.startsWith("/seller/register") ||
    location.pathname.startsWith("/seller/login");

  return (
    <div>
      {!hideNavbar && (
        <nav className="navbar">
          <div className="nav-logo">Seller Portal</div>
          <div className="nav-links">
            <NavLink to="/" className="nav-link">
              🏠 Home
            </NavLink>
            <NavLink to="/merchant" className="nav-link">
              🛒 Merchant
            </NavLink>
            <NavLink to="/wallet" className="nav-link">
              💰 Wallet
            </NavLink>
            <NavLink to="/admin" className="nav-link">
              🔧 Admin
            </NavLink>
          </div>
        </nav>
      )}

      <div className="page-content">{children}</div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<div>Home</div>} />
          <Route path="/merchant" element={<MerchantOrders />} />
          <Route path="/wallet" element={<WalletPage />} />

          {/* Seller routes */}
          <Route path="/seller/register" element={<SellerRegistration />} />
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route
            path="/seller/dashboard"
            element={<div>Seller Dashboard 🚀</div>}
          />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedAdmin>
                <AdminDashboard />
              </ProtectedAdmin>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<div>404 Page Not Found</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
