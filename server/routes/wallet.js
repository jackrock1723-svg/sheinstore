// routes/wallet.js
const express = require("express");
const router = express.Router();
const Wallet = require("../models/wallet");
const Seller = require("../models/seller");
const Withdraw = require("../models/withdraw");
const authMiddleware = require("../middleware/authMiddleware");

// Get wallet by sellerId
router.get("/:sellerId", authMiddleware(["seller", "admin"]), async (req, res) => {
  try {
    const { sellerId } = req.params;

    let wallet = await Wallet.findOne({ sellerId });

    // if no wallet yet → create new
    if (!wallet) {
      wallet = new Wallet({
        sellerId,
        balance: 0,
        history: []
      });
      await wallet.save();
    }

    res.json(wallet);
  } catch (err) {
    console.error("❌ wallet fetch error:", err);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});

// Withdraw request
router.post("/withdraw/:sellerId", authMiddleware(["seller"]), async (req, res) => {
  try {
    const { amount, method, bankDetails } = req.body;
    let wallet = await Wallet.findOne({ sellerId: req.params.sellerId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    if (amount > wallet.balance) return res.status(400).json({ error: "Insufficient balance" });

    wallet.balance -= amount;
    wallet.history.push({
      type: "debit",
      amount,
      note: `Withdrawal (${method})`,
    });

    await wallet.save();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: credit seller wallet manually
router.post("/admin/credit/:sellerId", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { amount, note } = req.body;
    let wallet = await Wallet.findOne({ sellerId: req.params.sellerId });
    if (!wallet) {
      wallet = new Wallet({ sellerId: req.params.sellerId, balance: 0, history: [] });
    }

    wallet.balance += amount;
    wallet.history.push({ type: "credit", amount, note: note || "Admin credit" });

    await wallet.save();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🔴 Admin view all withdraw requests
router.get("/withdraw/all", async (req, res) => {
  try {
    const withdraws = await Withdraw.find().populate("sellerId");
    res.json(withdraws);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔴 Admin approve/reject withdraw
router.post("/approve/:id", async (req, res) => {
  try {
    const { action } = req.body;
    const withdraw = await Withdraw.findById(req.params.id);
    if (!withdraw) return res.status(404).json({ error: "Withdraw not found" });

    const wallet = await Wallet.findOne({ ownerId: withdraw.sellerId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    if (action === "approve") {
      if (wallet.balance < withdraw.amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      wallet.balance -= withdraw.amount;
      wallet.history.push({
        type: "debit",
        amount: withdraw.amount,
        note: "Withdrawal approved",
        date: new Date()
      });
      withdraw.status = "approved";
      await wallet.save();
      await withdraw.save();
      return res.json({ message: "Withdrawal approved", withdraw, wallet });
    } else if (action === "reject") {
      withdraw.status = "rejected";
      await withdraw.save();
      return res.json({ message: "Withdrawal rejected", withdraw });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
