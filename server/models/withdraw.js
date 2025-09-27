// models/withdraw.js
const mongoose = require("mongoose");

const WithdrawSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true }, // e.g. bank_transfer, upi
    bankDetails: {
      accountNumber: String,
      ifsc: String,
      upiId: String
    },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Withdraw || mongoose.model("Withdraw", WithdrawSchema);
