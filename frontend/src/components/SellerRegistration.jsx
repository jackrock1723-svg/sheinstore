// src/components/SellerRegistration.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SellerRegistration.css";

export default function SellerRegistration() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    storeType: "",
    storeName: "",
    ownerName: "",
    address: "",
    pincode: "",        // ✅ backend expects pincode
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    idDocument: null,   // ✅ backend expects idDocument
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  // submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      // build FormData object
      const formData = new FormData();
      formData.append("storeType", form.storeType);
      formData.append("storeName", form.storeName);
      formData.append("ownerName", form.ownerName);
      formData.append("address", form.address);
      formData.append("pincode", form.pincode);
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("idType", "Aadhar"); // static for now
      if (form.idDocument) {
        formData.append("idDocument", form.idDocument);
      }

      // debug log
      for (let [key, value] of formData.entries()) {
        console.log("🔍 FormData:", key, value);
      }

      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/public-seller/register`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setStep(3);
    } catch (err) {
      console.error("❌ Registration error", err.response?.data || err.message);
      alert("Registration failed. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        {/* Step 1: Terms + store type */}
        {step === 1 && (
          <>
            <h2>Terms & Store Type</h2>
            <p className="terms">
              Please read our <b>Terms & Conditions</b> before proceeding.
            </p>
            <div className="store-type">
              <label>
                <input
                  type="radio"
                  name="storeType"
                  value="Individual"
                  checked={form.storeType === "Individual"}
                  onChange={handleChange}
                />
                Individual
              </label>
              <label>
                <input
                  type="radio"
                  name="storeType"
                  value="Enterprise"
                  checked={form.storeType === "Enterprise"}
                  onChange={handleChange}
                />
                Enterprise
              </label>
            </div>
            <button
              disabled={!form.storeType}
              onClick={() => setStep(2)}
              className="next-btn"
            >
              Next →
            </button>
          </>
        )}

        {/* Step 2: Registration form */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <h2>Seller Registration</h2>
            <input
              type="text"
              name="storeName"
              placeholder="Store Name"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="ownerName"
              placeholder="Owner Name"
              onChange={handleChange}
              required
            />
            <textarea
              name="address"
              placeholder="Full Address"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
            />
            <label className="file-upload">
              Upload Verification Document
              <input
                type="file"
                name="idDocument" // ✅ must match backend
                accept=".jpg,.png,.pdf"
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}

        {/* Step 3: Success screen */}
        {step === 3 && (
          <div className="status">
            <h2>Registration Submitted ✅</h2>
            <p>
              Your seller registration is under review.
              <br />
              Status: <b>Pending</b>
            </p>
            <button className="home-btn" onClick={() => navigate("/")}>
              ⬅ Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
