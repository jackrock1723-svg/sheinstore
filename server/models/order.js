// models/order.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  method: { type: String }, // e.g., "UPI", "Razorpay", "Netbanking"
  screenshotUrl: { type: String },
  status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  verifiedAt: { type: Date }
}, { _id: false });

const ShipmentSchema = new mongoose.Schema({
  requestedAt: { type: Date },
  shippedAt: { type: Date },
  inTransitAt: { type: Date },
  deliveredAt: { type: Date }
}, { _id: false });

const OrderSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    productId: { type: String, required: true },
    productTitle: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    earn: { type: Number, required: true, default: 0 },

    status: {
      type: String,
      enum: [
        "payment_pending",
        "payment_verified",
        "shipped",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      default: "payment_pending",
    },

    payment: { type: PaymentSchema, default: () => ({}) },
    shipment: { type: ShipmentSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// optional: keep updatedAt fresh on save (timestamps option already does this)
OrderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// safe export to avoid OverwriteModelError during hot reloads or multiple requires
module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
