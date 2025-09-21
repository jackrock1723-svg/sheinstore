const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  role: { type: String, enum: ["seller", "admin"], default: "seller" }
}, { timestamps: true });

module.exports = mongoose.model("Seller", sellerSchema);
