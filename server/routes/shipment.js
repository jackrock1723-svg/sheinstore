const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Order = require("../models/order");
const Wallet = require("../models/wallet");
const Seller = require("../models/seller");

// 🔹 Ensure uploads directory exists
const uploadPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// 🔹 Configure Multer for screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`);
  },
});
const upload = multer({ storage });

/**
 * 👉 Seller requests shipment and uploads payment screenshot
 * Fields: sellerId, productId, productTitle, price, earn
 */
router.post("/request", upload.single("screenshot"), async (req, res) => {
  try {
    const { sellerId, productId, productTitle, price, earn } = req.body;
    const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Create new order
    const order = new Order({
      sellerId,
      productId,
      productTitle,
      price: Number(price || 0),
      earn: Number(earn || 0),
      status: "payment_pending",
      payment: {
        method: "UPI",
        upiId: process.env.PAYMENT_UPI_ID || "merchantupi@okaxis", // ✅ from env
        screenshotUrl,
        status: "pending",
      },
      shipment: { requestedAt: new Date() },
    });

    await order.save();

    // 🔎 Simple auto-verification (simulated)
    const isLikelyValid =
      req.file && req.file.size > 5 * 1024 && Number(price) > 0;

    if (isLikelyValid) {
      order.payment.status = "verified";
      order.payment.verifiedAt = new Date();
      order.status = "payment_verified";

      // Simulate shipping started
      order.shipment.shippedAt = new Date();
      order.status = "shipped";

      await order.save();
    }

    res.status(201).json({
      message: "Shipment request created",
      upiId: process.env.PAYMENT_UPI_ID || "merchantupi@okaxis",
      order,
    });
  } catch (err) {
    console.error("❌ shipment request error", err);
    res.status(500).json({ error: "Failed to create shipment request" });
  }
});

/**
 * 👉 Admin or automated verification (manual override)
 * POST /api/shipment/verify/:orderId
 * body: { action: "verify" | "reject" }
 */
router.post("/verify/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (action === "verify") {
      order.payment.status = "verified";
      order.payment.verifiedAt = new Date();
      order.status = "payment_verified";
      order.shipment.shippedAt = new Date();
      order.status = "shipped";
      await order.save();

      return res.json({
        message: "✅ Payment verified and shipment started",
        order,
      });
    } else {
      order.payment.status = "rejected";
      order.status = "cancelled";
      await order.save();
      return res.json({ message: "❌ Payment rejected", order });
    }
  } catch (err) {
    console.error("❌ verify error", err);
    res.status(500).json({ error: "Verify failed" });
  }
});

/**
 * 👉 Fetch all seller orders
 */
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.params.sellerId }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    console.error("❌ fetch seller orders error", err);
    res.status(500).json({ error: "Failed to fetch seller orders" });
  }
});

module.exports = router;
