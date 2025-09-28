import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SellerLogin.css";

export default function SellerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_BACKEND_URL || "https://api.shienstore.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/seller/login`, {
        email,
        password,
      });

      console.log("✅ Seller login response:", res.data);

      // ⚡ Store in standard keys used by ProtectedRoute
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("role", "seller");
      localStorage.setItem("seller", JSON.stringify(res.data.seller));
      localStorage.setItem("sellerId", res.data.seller.id || res.data.seller._id);

      navigate("/seller/dashboard");
    } catch (err) {
      console.error("❌ Login error", err.response?.data || err.message);
      alert(err.response?.data?.error || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Seller Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="note">
          Don’t have an account? <a href="/seller/register">Register here</a>
        </p>
      </div>
    </div>
  );
}
