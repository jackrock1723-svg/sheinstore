// models/seller.js
const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    storeType: { type: String, enum: ["Individual", "Enterprise"], required: true },
    storeName: { type: String, required: true },
    name: { type: String, required: true }, // owner name
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // 👇 NEW
    password: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    role: { type: String, enum: ["seller", "admin"], default: "seller" },

    idDocument: {
      type: { type: String, enum: ["Aadhar", "PAN", "Passport"], default: null },
      url: { type: String, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seller", sellerSchema);
