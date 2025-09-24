// server/routes/adminPanel.js
const express = require("express");
const router = express.Router();
const Seller = require("../models/seller");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/admin/sellers
// Requires admin token
router.get("/", authMiddleware(["admin"]), async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 });
    res.json(sellers);
  } catch (err) {
    console.error("admin list sellers error", err);
    res.status(500).json({ error: "Failed to fetch sellers" });
  }
});

// POST /api/admin/sellers/:id/approve
router.post("/:id/approve", authMiddleware(["admin"]), async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!seller) return res.status(404).json({ error: "Seller not found" });
    res.json({ message: "Seller approved", seller });
  } catch (err) {
    console.error("approve error", err);
    res.status(500).json({ error: "Approve failed" });
  }
});

// POST /api/admin/sellers/:id/reject
router.post("/:id/reject", authMiddleware(["admin"]), async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!seller) return res.status(404).json({ error: "Seller not found" });
    res.json({ message: "Seller rejected", seller });
  } catch (err) {
    console.error("reject error", err);
    res.status(500).json({ error: "Reject failed" });
  }
});

module.exports = router;
