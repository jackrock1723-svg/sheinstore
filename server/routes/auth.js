const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Seller = require("../models/seller");


// 📝 Seller Registration
router.post("/register-seller", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ msg: "Seller already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new seller (status = pending by default)
    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      status: "pending",   // 👈 sellers must be approved by admin
      role: "seller"
    });

    await newSeller.save();

    res.status(201).json({ msg: "Seller registered successfully. Waiting for admin approval." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔑 Seller & Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if seller/admin exists
    const user = await Seller.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // ✅ Block seller if not approved
    if (user.role === "seller" && user.status !== "approved") {
      return res.status(403).json({
        error: `Your account is ${user.status}. Please wait for admin approval.`,
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role || "seller" }, // default role = seller
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role || "seller" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
