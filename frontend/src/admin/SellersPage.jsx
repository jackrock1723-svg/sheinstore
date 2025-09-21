import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken"); // ✅ admin login token

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/admin/sellers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSellers(res.data);
      } catch (err) {
        console.error("❌ fetch sellers error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, [token]);

  const handleAction = async (id, action) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/sellers/${id}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSellers((prev) =>
        prev.map((s) =>
          s._id === id
            ? { ...s, status: action === "approve" ? "approved" : "rejected" }
            : s
        )
      );
    } catch (err) {
      console.error(`❌ ${action} error`, err);
    }
  };

  if (loading) return <p>Loading sellers...</p>;

  return (
    <div>
      <h2>Sellers</h2>
      {sellers.length === 0 ? (
        <p>No sellers found</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Email</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Status</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s._id}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {s.name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {s.email}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {s.status}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {s.status === "pending" ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleAction(s._id, "approve")}
                        style={{
                          background: "green",
                          color: "#fff",
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(s._id, "reject")}
                        style={{
                          background: "red",
                          color: "#fff",
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
