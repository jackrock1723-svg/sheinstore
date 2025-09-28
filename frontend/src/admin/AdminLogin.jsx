import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // 👇 Automatically switch between localhost (dev) and Render (prod)
  const API_BASE =
    process.env.REACT_APP_BACKEND_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/admin/auth/login`, {
        email,
        password,
      });

      console.log("✅ Admin login response:", res.data);

      // ✅ Save standardized keys like SellerLogin
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("role", "admin");
      localStorage.setItem("admin", JSON.stringify(res.data.admin));

      nav("/admin/dashboard");
    } catch (err) {
      console.error("❌ Admin login failed:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "40px auto",
        padding: 20,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      }}
    >
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
          required
        />
        <button type="submit" disabled={loading} style={{ padding: "10px 14px" }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
