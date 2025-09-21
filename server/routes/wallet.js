const express = require("express");
const router = express.Router();
const Wallet = require("../models/wallet");
const Seller = require("../models/seller");
const mongoose = require("mongoose");
const Withdraw = require("../models/withdraw");
// Withdraw request model

// 🟢 Fetch wallet (auto-create if missing)
router.get("/:sellerId", async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ ownerId: req.params.sellerId }).populate("ownerId");
    if (!wallet) {
      // auto-create wallet if missing
      const seller = await Seller.findById(req.params.sellerId);
      if (!seller) return res.status(404).json({ error: "Seller not found" });

      wallet = new Wallet({
        ownerId: seller._id,
        balance: 0,
        history: []
      });
      await wallet.save();
    }

    res.json({ ...wallet.toObject(), owner: wallet.ownerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟡 Seller creates withdraw request
router.post("/withdraw/:sellerId", async (req, res) => {
  try {
    const { amount, method } = req.body;
    const sellerId = req.params.sellerId;

    const wallet = await Wallet.findOne({ ownerId: sellerId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    if (amount <= 0 || amount > wallet.balance) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const withdraw = new Withdraw({ sellerId, amount, method });
    await withdraw.save();

    res.json({ message: "Withdraw request created", withdraw });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔴 Admin approves/rejects withdraw request
router.post("/approve/:id", async (req, res) => {
  try {
    const { action } = req.body; // approve or reject
    const withdraw = await Withdraw.findById(req.params.id);
    if (!withdraw) return res.status(404).json({ error: "Withdraw request not found" });

    if (withdraw.status !== "pending") {
      return res.status(400).json({ error: `Already ${withdraw.status}` });
    }

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
        note: "Withdrawal approved"
      });
      await wallet.save();

      withdraw.status = "approved";
      await withdraw.save();

      res.json({ message: "Withdrawal approved", wallet, withdraw });
    } else if (action === "reject") {
      withdraw.status = "rejected";
      await withdraw.save();
      res.json({ message: "Withdrawal rejected", withdraw });
    } else {
      res.status(400).json({ error: "Invalid action" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
