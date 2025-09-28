// server/routes/adminOrders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Seller = require("../models/seller");
const authMiddleware = require("../middleware/authMiddleware");
const Wallet = require("../models/wallet");

router.put("/orders/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("sellerId");
    if (!order) return res.status(404).json({ error: "Order not found" });

    // update order fields
    order.price = req.body.price || order.price;
    order.earn = req.body.earn || order.earn;
    order.status = req.body.status || order.status;
    await order.save();

    // ✅ If admin verifies payment → add to seller wallet
    if (order.status === "payment_verified" || order.status === "completed") {
      const totalAmount = Number(order.price) + Number(order.earn);

      let wallet = await Wallet.findOne({ sellerId: order.sellerId._id });
      if (!wallet) {
        wallet = new Wallet({ sellerId: order.sellerId._id, balance: 0, history: [] });
      }

      wallet.balance += totalAmount;
      wallet.history.push({
        type: "credit",
        amount: totalAmount,
        note: `Earnings from order ${order.orderId}`, // ✅ friendly orderId
        date: new Date(),
      });

      await wallet.save();
    }

    res.json(order);
  } catch (err) {
    console.error("❌ update order error", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});


// ✅ Get all orders (with seller info)
router.get("/", authMiddleware(["admin"]), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ fetch admin orders error", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ Update order (status or amount)
router.put("/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, price, earn } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (status) order.status = status;
    if (price) order.price = price;
    if (earn) order.earn = earn;

    await order.save();
    res.json({ message: "Order updated", order });
  } catch (err) {
    console.error("❌ update order error", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// ✅ Delete order
router.delete("/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error("❌ delete order error", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
