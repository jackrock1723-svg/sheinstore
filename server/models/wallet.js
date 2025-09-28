const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0 },
    history: [
      {
        type: { type: String, enum: ["credit", "debit", "withdrawal"] },
        amount: { type: Number, required: true },
        note: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);
