const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Seller = require("../models/seller");
const Order = require("../models/order");
const Wallet = require("../models/wallet");
const mongoose = require("mongoose");

// All routes protected to admins
router.use(authMiddleware(["admin"]));
    
// GET sellers (optionally filter by status)
router.get("/sellers", async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const sellers = await Seller.find(query).select("-password").sort({ createdAt: -1 });
    res.json(sellers);
  } catch (err) {
    console.error("admin get sellers", err);
    res.status(500).json({ error: "Failed to fetch sellers" });
  }
});

// Approve seller
router.post("/sellers/:id/approve", async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ error: "Seller not found" });

    seller.status = "approved";
    await seller.save();

    res.json({ message: "Seller approved", seller });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject seller
router.post("/sellers/:id/reject", async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ error: "Seller not found" });

    seller.status = "rejected";
    await seller.save();

    res.json({ message: "Seller rejected", seller });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});     
// Get all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("admin orders", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Verify payment for order (use same logic as /api/shipment/verify/:orderId)
router.post("/orders/:id/verify", async (req, res) => {
  try {
    const { action } = req.body; // verify or reject
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (action === "verify") {
      order.payment.status = "verified";
      order.payment.verifiedAt = new Date();
      order.status = "payment_verified";
      order.shipment.shippedAt = new Date();
      order.status = "shipped";
      await order.save();
      return res.json({ message: "Order verified and shipped", order });
    } else {
      order.payment.status = "rejected";
      order.status = "cancelled";
      await order.save();
      return res.json({ message: "Order rejected", order });
    }
  } catch (err) {
    console.error("verify order", err);
    res.status(500).json({ error: "Verify failed" });
  }
});

// Get withdrawals (pending)
const Withdraw = mongoose.models.Withdraw || mongoose.model("Withdraw", new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  amount: Number,
  method: String,
  status: { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
}));

router.get("/withdrawals", async (req, res) => {
  try {
    const list = await Withdraw.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("get withdrawals", err);
    res.status(500).json({ error: "Failed" });
  }
});

// Approve/reject withdrawal
router.post("/withdrawals/:id", async (req, res) => {
  try {
    const { action } = req.body; // approve | reject
    const withdraw = await Withdraw.findById(req.params.id);
    if (!withdraw) return res.status(404).json({ error: "Withdraw not found" });
    if (withdraw.status !== "pending") return res.status(400).json({ error: "Already processed" });

    const wallet = await Wallet.findOne({ ownerId: withdraw.sellerId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    if (action === "approve") {
      if (wallet.balance < withdraw.amount) return res.status(400).json({ error: "Insufficient funds" });

      wallet.balance -= withdraw.amount;
      wallet.history.push({ type: "debit", amount: withdraw.amount, note: "Withdrawal approved" });
      await wallet.save();

      withdraw.status = "approved";
      await withdraw.save();

      return res.json({ message: "Withdrawal approved", wallet, withdraw });
    } else {
      withdraw.status = "rejected";
      await withdraw.save();
      return res.json({ message: "Withdrawal rejected", withdraw });
    }
  } catch (err) {
    console.error("process withdraw", err);
    res.status(500).json({ error: "Failed" });
  }
});

module.exports = router;
