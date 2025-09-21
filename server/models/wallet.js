// models/wallet.js
const mongoose = require("mongoose");

const walletHistorySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    note: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const walletSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    balance: { type: Number, default: 0 },
    history: [walletHistorySchema],
  },
  { timestamps: true }
);

// Safe export
module.exports = mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
