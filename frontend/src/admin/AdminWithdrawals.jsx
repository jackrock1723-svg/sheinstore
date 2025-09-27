// src/admin/AdminWithdrawals.jsx
import "./AdminWithdrawals.css"
import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminWithdrawals = () => {
  const [withdraws, setWithdraws] = useState([]);

  const fetchWithdraws = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/wallet/withdraw/all`);
      setWithdraws(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/wallet/approve/${id}`, { action });
      alert(`Withdrawal ${action}ed`);
      fetchWithdraws();
    } catch (err) {
      alert(err.response?.data?.error || "Action failed");
    }
  };

  useEffect(() => { fetchWithdraws(); }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Withdraw Requests</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Seller</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Bank/UPI Details</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {withdraws.map(w => (
            <tr key={w._id}>
              <td>{w.sellerId?.email}</td>
              <td>₹{w.amount}</td>
              <td>{w.method}</td>
              <td>{w.status}</td>
              <td>
                {w.method === "bank_transfer"
                  ? `${w.bankDetails?.accountNumber} / ${w.bankDetails?.ifsc}`
                  : w.bankDetails?.upiId}
              </td>
              <td>
                {w.status === "pending" && (
                  <>
                    <button onClick={() => handleAction(w._id, "approve")}>Approve</button>
                    <button onClick={() => handleAction(w._id, "reject")}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminWithdrawals;
