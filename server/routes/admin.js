const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");   // ✅ Add this
const Seller = require("../models/seller"); // ✅ Capital S
const authMiddleware = require("../middleware/authMiddleware");
const Product = require("../models/product");  // ✅ import product model


// ================== ADMIN AUTH ==================

// Admin Registration (one-time setup)
router.post("/register-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if admin already exists
    const existingAdmin = await Admin.findOne({ email }); // ✅ Fix
    if (existingAdmin) {
      return res.status(400).json({ msg: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: "admin" // ✅ store role properly
    });

    await newAdmin.save();

    res.status(201).json({ msg: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products (admin only)
router.get("/products", authMiddleware(["admin"]), async (req, res) => {
  try {
    const products = await Product.find().populate("seller", "name email status");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================== ADMIN ACTIONS ==================

// Get sellers (only admin can view)
router.get("/sellers", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const sellers = await Seller.find(query);
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve a seller (only admin)
router.put("/sellers/:id/approve", authMiddleware(["admin"]), async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!seller) return res.status(404).json({ error: "Seller not found" });
    res.json({ msg: "Seller approved", seller });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject a seller (only admin)
router.put("/sellers/:id/reject", authMiddleware(["admin"]), async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!seller) return res.status(404).json({ error: "Seller not found" });
    res.json({ msg: "Seller rejected", seller });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected admin dashboard
router.get("/dashboard", authMiddleware(["admin"]), (req, res) => {
  res.json({
    message: `Welcome Admin ${req.user.id}`,
    role: req.user.role,
  });
});


module.exports = router;
