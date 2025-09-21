// models/withdraw.js
const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["UPI", "Bank Transfer"], required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Fix OverwriteModelError by reusing if already compiled
module.exports = mongoose.models.Withdraw || mongoose.model("Withdraw", withdrawSchema);
