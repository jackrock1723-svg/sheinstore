// server/routes/orders.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Order = require("../models/order"); // ✅ make sure file is "order.js", not "orders.js"
const authMiddleware = require("../middleware/authMiddleware");

// ensure upload folder
const uploadDir = path.join(__dirname, "..", "uploads", "payment_proofs");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// 👉 Seller uploads payment proof
router.post(
  "/:orderId/proof",
  upload.single("proof"), // must match frontend formData.append("proof", file)
  authMiddleware(["seller"]),
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });

      if (String(order.sellerId) !== String(req.user.id)) {
        return res.status(403).json({ error: "Not allowed" });
      }

      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const url = `/uploads/payment_proofs/${req.file.filename}`;
      order.paymentProofs = order.paymentProofs || [];
      order.paymentProofs.push({
        url,
        uploadedBy: req.user.id,
        uploadedAt: new Date(),
      });

      order.paymentStatus = "pending_proof";
      await order.save();

      res.json({
        success: true,
        message: "✅ Payment proof uploaded successfully. Pending admin verification.",
        proofUrl: url,
      });
    } catch (err) {
      console.error("upload proof error", err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// 👉 Admin: list pending proofs
router.get("/proofs/pending", authMiddleware(["admin"]), async (req, res) => {
  try {
    const orders = await Order.find({
      "paymentProofs.0": { $exists: true },
      paymentStatus: "pending_proof",
    })
      .populate("sellerId", "name email")
      .lean();
    res.json(orders);
  } catch (err) {
    console.error("get proofs error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 👉 Admin: verify proof
router.post("/:orderId/proofs/:index/verify", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { orderId, index } = req.params;
    const idx = parseInt(index, 10);

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (!order.paymentProofs || !order.paymentProofs[idx]) {
      return res.status(400).json({ error: "Proof not found" });
    }

    order.paymentProofs[idx].verified = true;
    order.paymentProofs[idx].verifiedBy = req.user.id;
    order.paymentProofs[idx].verifiedAt = new Date();
    order.paymentStatus = "paid";

    order.status = "shipped";
    order.shipment = order.shipment || {};
    order.shipment.shippedAt = new Date();

    await order.save();

    res.json({ message: "✅ Proof verified. Order moved to Shipped.", order });
  } catch (err) {
    console.error("verify proof error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 👉 Admin: reject proof
router.post("/:orderId/proofs/:index/reject", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { orderId, index } = req.params;
    const idx = parseInt(index, 10);

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (!order.paymentProofs || !order.paymentProofs[idx]) {
      return res.status(400).json({ error: "Proof not found" });
    }

    order.paymentProofs[idx].notes = req.body.notes || "Rejected by admin";
    order.paymentProofs[idx].verified = false;
    order.paymentStatus = "unpaid";

    await order.save();

    res.json({ message: "❌ Proof rejected. Seller notified.", order });
  } catch (err) {
    console.error("reject proof error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 👉 Get seller orders
router.get("/:sellerId", authMiddleware(["seller", "admin"]), async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.params.sellerId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 Admin creates order
router.post("/", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { sellerId, productName, price, quantity, image } = req.body;
    const order = new Order({ sellerId, productName, price, quantity, image });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
