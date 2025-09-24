// routes/adminAuth.js
const express = require("express");
const router = express.Router();
const Seller = require("../models/seller"); // using Seller model for admin
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔑 Admin Login
router.post("/login", async (req, res) => {
  try {
    console.log("📥 Body received:", req.body);

    const { email, password } = req.body;

    // explicitly select password
    const admin = await Seller.findOne({ email, role: "admin" }).select("+password");
    if (!admin) {
      return res.status(400).json({ error: "Admin not found" });
    }

    console.log("🔑 Hash from DB:", admin.password);

    const validPass = await bcrypt.compare(password, admin.password);
    if (!validPass) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name || "Admin",
      },
    });
  } catch (err) {
    console.error("admin login error", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
