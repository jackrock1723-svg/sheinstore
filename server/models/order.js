const mongoose = require("mongoose");
const Wallet = require("./wallet");

// ------------------ Payment Schema ------------------
const PaymentSchema = new mongoose.Schema(
  {
    method: { type: String }, // e.g., "UPI", "Razorpay"
    screenshotUrl: { type: String }, // file path or external URL
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedAt: { type: Date },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ------------------ Shipment Schema ------------------
const ShipmentSchema = new mongoose.Schema(
  {
    requestedAt: { type: Date },
    shippedAt: { type: Date },
    inTransitAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { _id: false }
);

// ------------------ Order Schema ------------------
const OrderSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    productId: { type: String, required: true },
    productTitle: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    earn: { type: Number, required: true, default: 0 },

    orderId: { type: String, unique: true }, // ✅ Friendly order id

    status: {
      type: String,
      enum: [
        "payment_pending",
        "payment_verified",
        "shipped",
        "in_transit",
        "delivered",
        "completed",
        "cancelled",
      ],
      default: "payment_pending",
    },

    payment: { type: PaymentSchema, default: () => ({}) },
    shipment: { type: ShipmentSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// ------------------ Hooks ------------------

// Generate friendly orderId
OrderSchema.pre("save", function (next) {
  if (!this.orderId) {
    this.orderId = "ORD-" + Date.now().toString().slice(-6); // e.g., ORD-483920
  }
  this.updatedAt = Date.now();
  next();
});

// Wallet credit logic
OrderSchema.post("save", async function (doc, next) {
  try {
    // Only credit once
    if (["payment_verified", "completed"].includes(doc.status) && !doc.walletCredited) {
      const totalAmount = Number(doc.price) + Number(doc.earn);

      let wallet = await Wallet.findOne({ sellerId: doc.sellerId });
      if (!wallet) {
        wallet = new Wallet({
          sellerId: doc.sellerId,
          balance: 0,
          history: [],
        });
      }

      wallet.balance += totalAmount;
      wallet.history.push({
        type: "credit",
        amount: totalAmount,
        note: `Earnings from order ${doc.orderId}`,
        date: new Date(),
      });

      await wallet.save();

      // mark as credited
      doc.walletCredited = true;
      await doc.save();
    }
  } catch (err) {
    console.error("❌ Wallet update error:", err);
  }
  next();
});


// ------------------ Export ------------------
module.exports =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
