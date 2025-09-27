// src/components/SellerWallet.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SellerWallet.css";


const SellerWallet = ({ sellerId }) => {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [bankDetails, setBankDetails] = useState({ accountNumber: "", ifsc: "", upiId: "" });

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/wallet/${sellerId}`)
      .then(res => setWallet(res.data))
      .catch(err => console.error(err));
  }, [sellerId]);

  const requestWithdraw = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/wallet/withdraw/${sellerId}`, {
        amount: Number(amount),
        method,
        bankDetails
      });
      alert("Withdraw request submitted!");
      setAmount("");
    } catch (err) {
      alert(err.response?.data?.error || "Withdraw failed");
    }
  };

  if (!wallet) return <p>Loading wallet...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>💰 Wallet Balance: ₹{wallet.balance}</h2>
      <h3>History</h3>
      <ul>
        {wallet.history.map((h, i) => (
          <li key={i}>{h.date?.substring(0,10)} - {h.type} - ₹{h.amount} ({h.note})</li>
        ))}
      </ul>
      <h3>Request Withdrawal</h3>
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
  );
};

export default SellerWallet;
