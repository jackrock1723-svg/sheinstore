const express = require("express");
const router = express.Router();
const Seller = require("../models/seller");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const authMiddleware = require("../middleware/authMiddleware");

// 🛡️ Protected seller route
router.get("/dashboard", authMiddleware(["seller"]), (req, res) => {
  res.json({
    message: `Welcome ${req.user.id}, role: ${req.user.role}`,
  });
});

// 📝 Seller Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // 1️⃣ Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // 2️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3️⃣ Create new seller
    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      status: "pending" // 👈 default until admin approves
    });

    await newSeller.save();
    res.status(201).json({ msg: "Seller registered, awaiting admin approval" });

  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ✅ Approve seller
router.put("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json({ message: "Seller approved successfully", seller });
  } catch (err) {
    console.error("approve seller error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔑 Seller Login (only if approved)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    if (seller.status !== "approved") {
      return res.status(403).json({ error: `Access denied. Current status: ${seller.status}` });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = generateToken(seller._id, "seller");

    res.json({
      message: "Login successful",
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        status: seller.status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // ✅ Only this for CommonJS
