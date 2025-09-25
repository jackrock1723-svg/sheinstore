const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const multer = require("multer");
const Seller = require("../models/seller");
const bcrypt = require("bcrypt");
const path = require("path");
const generateToken = require("../utils/generateToken");


// 🛡️ Protected seller route
router.get("/dashboard", authMiddleware(["seller"]), (req, res) => {
  res.json({
    message: `Welcome ${req.user.id}, role: ${req.user.role}`,
  });
});


// storage config for documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/sellers"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Seller Registration with file upload
router.post("/register", upload.single("document"), async (req, res) => {
  try {
    const { storeType, storeName, ownerName, address, pin, phone, email } = req.body;

    if (!storeType || !storeName || !ownerName || !address || !pin || !phone || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const seller = new Seller({
      storeType,
      storeName,
      name: ownerName,
      address,
      pin,
      phone,
      email,
      document: req.file ? `/uploads/sellers/${req.file.filename}` : null,
      status: "pending",
    });

    await seller.save();
    res.status(201).json({ message: "Seller registered successfully", seller });
  } catch (err) {
    console.error("❌ Seller register error", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", authMiddleware(["seller"]), async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      role: req.user.role,
      email: req.user.email || null,
      message: "Seller authenticated successfully"
    });
  } catch (err) {
    console.error("❌ /me route error", err);
    res.status(500).json({ error: "Server error" });
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
      return res.status(403).json({ error: `Access denied. Status: ${seller.status}` });
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
    console.error("Seller login error", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router; // ✅ Only this for CommonJS
