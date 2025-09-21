import React, { useEffect, useState } from "react";
import axios from "axios";
import "./wallet.css";

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const sellerId = localStorage.getItem("sellerId"); // must be set after login
  const token = localStorage.getItem("token");

  // Fetch wallet
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get(`/api/wallet/${sellerId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setWallet(res.data);
      } catch (err) {
        console.error("fetch wallet error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [sellerId, token]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      const res = await axios.post(
        `/api/wallet/withdraw/${sellerId}`,
        { amount: Number(withdrawAmount), method: "UPI" },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      setWallet(res.data.wallet); // update UI with new wallet
      setWithdrawAmount("");
      alert("Withdrawal request successful ✅");
    } catch (err) {
      alert(err.response?.data?.error || "Withdrawal failed ❌");
    }
  };

  if (loading) return <div>Loading wallet...</div>;
  if (!wallet) return <div>No wallet found</div>;

  return (
    <div className="wallet-container">
      {/* Seller profile header */}
      <div className="wallet-header">
        <img
          src={`https://ui-avatars.com/api/?name=${wallet.owner?.name || "S"}`}
          alt="seller avatar"
          className="wallet-avatar"
        />
        <div className="wallet-info">
          <h2>{wallet.owner?.name || "Seller"}</h2>
          <p>{wallet.owner?.email}</p>
        </div>
      </div>

      {/* Balance card */}
      <div className="wallet-balance-card">
        <h3>Wallet Balance</h3>
        <p className="balance">₹{wallet.balance.toFixed(2)}</p>
      </div>

      {/* Withdraw section */}
      <div className="wallet-withdraw">
        <input
          type="number"
          placeholder="Enter amount"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />
        <button onClick={handleWithdraw}>Withdraw</button>
      </div>

      {/* Transaction history */}
      <div className="wallet-history">
        <h3>Transaction History</h3>
        {wallet.history.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          <ul>
            {wallet.history.map((txn, i) => (
              <li key={i} className={`txn txn-${txn.type}`}>
                <span>{txn.note}</span>
                <span className="txn-amount">
                  {txn.type === "credit" ? "+" : "-"}₹{txn.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
