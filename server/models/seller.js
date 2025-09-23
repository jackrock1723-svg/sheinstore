const mongoose = require("mongoose");

// models/seller.js (add fields)
const sellerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String, // keep for manual registration fallback if needed
  phone: String,
  address: String,
  status: { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  role: { type: String, enum: ["seller","admin"], default: "seller" },

  // NEW fields:
  shopifyCustomerId: { type: String, index: true, sparse: true },
  shopDomain: String, // e.g. "your-store.myshopify.com"
}, { timestamps: true });

module.exports = mongoose.models.Seller || mongoose.model("Seller", sellerSchema);

