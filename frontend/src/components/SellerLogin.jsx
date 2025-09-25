// src/components/SellerLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SellerLogin.css";

export default function SellerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/seller/login`,
        { email, password }
      );

      // ✅ Save token locally (for custom app use)
      localStorage.setItem("sellerToken", res.data.token);

      // ✅ Redirect to Shopify dashboard WITH token in query
      const token = encodeURIComponent(res.data.token);
      window.location.href = `https://sheinstore.online/pages/seller-dashboard?token=${token}`;
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
