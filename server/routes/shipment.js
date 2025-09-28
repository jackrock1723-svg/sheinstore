// server/routes/shipment.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Order = require("../models/order");
const Wallet = require("../models/wallet");
const Seller = require("../models/seller");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ import auth

// ------------------ Ensure uploads dir ------------------
const uploadPath = path.join(__dirname, "..", "uploads", "payment_proofs");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ------------------ Multer setup ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`);
  },
});
const upload = multer({ storage });

// ------------------ Seller requests shipment + uploads payment proof ------------------
/**
 * POST /api/shipment/request
 * Auth: Seller only
 * Fields: productId, productTitle, price, earn
 * File: screenshot
 */
router.post(
  "/request",
  authMiddleware(["seller"]), // ✅ only sellers can call this
  upload.single("screenshot"),
  async (req, res) => {
    try {
      const { productId, productTitle, price, earn } = req.body;
      const sellerId = req.user.id; // ✅ seller from token
      const screenshotUrl = req.file ? req.file.filename : null; // ✅ store only filename


      if (!sellerId || !productId || !productTitle) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const order = new Order({
        sellerId,
        productId,
        productTitle,
        price: Number(price),
        earn: Number(earn),
        status: "payment_pending",
        payment: {
          method: "UPI",
          screenshotUrl,
          status: "pending",
        },
        shipment: { requestedAt: new Date() },
      });

      await order.save();
      res.status(201).json({ message: "Order created", order });
    } catch (err) {
      console.error("❌ shipment request error", err);
      res.status(500).json({ error: "Failed to create order" });
    }
  }
);

// ------------------ Admin manually verifies or rejects payment ------------------
/**
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

      // start shipment
      order.shipment.shippedAt = new Date();
      order.status = "shipped";
      await order.save();

      return res.json({
        message: "✅ Payment verified. Shipment started.",
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

// ------------------ Fetch all seller orders ------------------
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
