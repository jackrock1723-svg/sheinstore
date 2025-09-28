// src/components/SellerWallet.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SellerWallet.css";


const SellerWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [bankDetails, setBankDetails] = useState({ accountNumber: "", ifsc: "", upiId: "" });

  const sellerId = localStorage.getItem("sellerId");

  useEffect(() => {
  const token = localStorage.getItem("authToken"); // same token used at login
  axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/wallet/${sellerId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => setWallet(res.data))
    .catch(err => {
      console.error("❌ wallet fetch error", err.response?.data || err.message);
      setWallet(null);
    });
}, [sellerId]);


  const requestWithdraw = async () => {
  try {
    const token = localStorage.getItem("authToken"); // get JWT
    if (!token) {
      alert("You are not logged in. Please log in again.");
      return;
    }

    const res = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/wallet/withdraw/${sellerId}`,
      {
        amount: Number(amount),
        method,
        bankDetails
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,  // ✅ attach token
        },
      }
    );

    alert("✅ Withdraw request submitted! Wait for Admin Review");
    setAmount("");
  } catch (err) {
    console.error("❌ withdraw error", err.response?.data || err.message);
    alert(err.response?.data?.error || "Withdraw failed");
  }
};


  if (!wallet) return <p>Loading wallet...</p>;

  return (
    <div className="wallet-container">
  <h2>💰 Wallet Balance: <span className="balance">₹{wallet.balance}</span></h2>

  <h3>📜 Transaction History</h3>
  <table className="wallet-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Note</th>
      </tr>
    </thead>
    <tbody>
      {wallet.history.map((h, i) => (
        <tr key={i}>
          <td>{new Date(h.date).toLocaleString()}</td>
          <td className={h.type}>{h.type}</td>
          <td>₹{h.amount}</td>
          <td>{h.note}</td>
        </tr>
      ))}
    </tbody>
  </table>

  <h3>🏦 Request Withdrawal</h3>
  <div className="withdraw-form">
    <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
    <select value={method} onChange={e => setMethod(e.target.value)}>
      <option value="bank_transfer">Bank Transfer</option>
      <option value="upi">UPI</option>
    </select>
    {method === "bank_transfer" && (
      <>
        <input placeholder="Account Number" onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} />
        <input placeholder="IFSC" onChange={e => setBankDetails({ ...bankDetails, ifsc: e.target.value })} />
      </>
    )}
    {method === "upi" && (
      <input placeholder="UPI ID" onChange={e => setBankDetails({ ...bankDetails, upiId: e.target.value })} />
    )}
    <button onClick={requestWithdraw}>Submit Withdraw</button>
  </div>
</div>

  );
};

export default SellerWallet;
