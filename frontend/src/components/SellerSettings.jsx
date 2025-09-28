import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./SellerSettings.css";

export default function SellerSettings() {
  const sellerId = localStorage.getItem("sellerId");
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await api.get(`/api/seller/${sellerId}`);
        setSeller(res.data);
      } catch (err) {
        console.error("❌ fetch seller error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeller();
  }, [sellerId]);

  const handleChange = (e) => {
    setSeller({ ...seller, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/api/seller/${sellerId}`, {
        name: seller.name,
        phone: seller.phone,
        address: seller.address,
        gstNumber: seller.gstNumber,
        shopName: seller.shopName,
      });
      alert("✅ Seller profile updated!");
      navigate("/seller/dashboard");
    } catch (err) {
      console.error("❌ update seller error", err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!seller) return <p>No seller data found.</p>;

  return (
    <div className="settings-container">
      <h2>⚙️ Seller Settings</h2>
      <div className="settings-form">
        <div className="form-group">
          <label>Email (not editable)</label>
          <input type="email" value={seller.email} disabled />
        </div>

        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={seller.name || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={seller.phone || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Shop Name</label>
          <input
            type="text"
            name="shopName"
            value={seller.shopName || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={seller.address || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>GST Number</label>
          <input
            type="text"
            name="gstNumber"
            value={seller.gstNumber || ""}
            onChange={handleChange}
          />
        </div>

        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "💾 Save Changes"}
        </button>
      </div>
    </div>
  );
}
