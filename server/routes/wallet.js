// routes/wallet.js
const express = require("express");
const router = express.Router();
const Wallet = require("../models/wallet");
const Seller = require("../models/seller");
const Withdraw = require("../models/withdraw");

// 🟢 Get seller wallet (auto-create if missing)
router.get("/:sellerId", async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ ownerId: req.params.sellerId });
    if (!wallet) {
      const seller = await Seller.findById(req.params.sellerId);
      if (!seller) return res.status(404).json({ error: "Seller not found" });

      wallet = new Wallet({ ownerId: seller._id, balance: 0, history: [] });
      await wallet.save();
    }
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟡 Create withdraw request
router.post("/withdraw/:sellerId", async (req, res) => {
  try {
    const { amount, method, bankDetails } = req.body;
    const sellerId = req.params.sellerId;

    const wallet = await Wallet.findOne({ ownerId: sellerId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    if (amount <= 0 || amount > wallet.balance) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const withdraw = new Withdraw({ sellerId, amount, method, bankDetails });
    await withdraw.save();

    res.json({ message: "Withdraw request created", withdraw });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
