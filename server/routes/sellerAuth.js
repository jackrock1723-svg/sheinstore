// routes/sellerAuth.js
const express = require("express");
const router = express.Router();
const Seller = require("../models/seller");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ✅ Seller Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(400).json({ error: "Seller not found" });

    if (seller.status !== "approved") {
      return res.status(403).json({ error: "Your account is not approved yet" });
    }

    const validPass = await bcrypt.compare(password, seller.password);
    if (!validPass) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: seller._id, role: "seller" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Seller login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
