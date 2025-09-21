// routes/adminAuth.js
const express = require("express");
const router = express.Router();
const Seller = require("../models/seller"); // ✅ use Seller model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔑 Admin Login
router.post("/login", async (req, res) => {
  try {
    console.log("📥 Body received:", req.body);

    const { email, password } = req.body;

    // find seller with role=admin
    const admin = await Seller.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(400).json({ error: "Admin not found" });
    }

    const validPass = await bcrypt.compare(password, admin.password);
    if (!validPass) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // generate token
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
