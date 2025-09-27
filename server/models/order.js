// models/order.js
const mongoose = require("mongoose");

// ------------------ Payment Schema ------------------
const PaymentSchema = new mongoose.Schema(
  {
    method: { type: String }, // e.g., "UPI", "Razorpay", "Netbanking"
    screenshotUrl: { type: String }, // file path or external URL
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedAt: { type: Date },
    uploadedAt: { type: Date, default: Date.now }, // 🆕 when proof uploaded
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

    // overall order status
    status: {
      type: String,
      enum: [
        "payment_pending",  // waiting for seller to pay + upload proof
        "payment_verified", // proof verified by admin
        "shipped",
        "in_transit",
        "delivered",
        "completed",        // ✅ auto after 2 days delivered
        "cancelled",
      ],
      default: "payment_pending",
    },

    // payment info
    payment: { type: PaymentSchema, default: () => ({}) },

    // shipment info
    shipment: { type: ShipmentSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// ------------------ Hooks ------------------

// keep updatedAt fresh (timestamps already does this, but extra safeguard)
OrderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// ------------------ Export ------------------
module.exports =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
