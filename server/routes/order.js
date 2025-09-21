const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const authMiddleware = require("../middleware/authMiddleware");

// 📌 Get all orders for a seller
router.get("/:sellerId", authMiddleware(["seller", "admin"]), async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.params.sellerId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Admin creates a new order for seller
router.post("/", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { sellerId, productName, price, quantity, image } = req.body;
    const order = new Order({
      sellerId,
      productName,
      price,
      quantity,
      image
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
