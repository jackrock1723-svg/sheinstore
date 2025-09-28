import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./WalletPage.css";

export default function AdminWallets() {
  const [wallets, setWallets] = useState([]);

  const fetchWallets = async () => {
    try {
      const res = await api.get("/api/admin/wallets");
      setWallets(res.data);
    } catch (err) {
      console.error("❌ fetch wallets error", err);
    }
  };

  const creditWallet = async (sellerId) => {
    const amount = prompt("Enter amount to credit:");
    if (!amount) return;
    await api.post(`/api/wallet/admin/credit/${sellerId}`, { amount: Number(amount) });
    fetchWallets();
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  return (
    <div className="wallet-container">
      <h2>👨‍💼 Seller Wallets</h2>
      <table className="wallet-table">
        <thead>
          <tr>
            <th>Seller</th>
            <th>Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {wallets.map((w) => (
            <tr key={w._id}>
              <td>{w.sellerId?.name}</td>
              <td>₹{w.balance}</td>
              <td>
                <button className="credit-btn" onClick={() => creditWallet(w.sellerId._id)}>
  + Credit
</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
