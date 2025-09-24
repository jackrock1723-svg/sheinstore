import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SellerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/seller/auth/login`,
        { email, password }
      );
      localStorage.setItem("sellerToken", res.data.token);
      window.location.href = "https://sheinstore.online/pages/seller-dashboard";
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }   
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 20, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}>
      <h2>Seller Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <button onClick={handleLogin} style={{ padding: "10px 14px" }}>Login</button>
    </div>
  );
}
