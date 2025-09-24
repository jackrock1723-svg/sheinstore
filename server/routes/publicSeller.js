// server/routes/publicSeller.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt"); // ensure bcrypt is installed
const Seller = require("../models/seller");

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, "..", "uploads", "seller_docs");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// POST /api/public-seller/register
// expects multipart/form-data fields:
//  - storeName, ownerName, address, phone, pincode, email, password, storeType (optional), idType (optional)
//  - file field: idDocument
router.post("/register", upload.single("idDocument"), async (req, res) => {
  try {
    // DEBUG: print incoming data (helps trace mismatches)
    console.log("📥 Web POST /api/public-seller/register");
    console.log("📥 Body:", req.body);
    console.log("📎 File:", req.file ? { filename: req.file.filename, size: req.file.size } : null);

    // extract fields (make tolerant to different names)
    const storeName = req.body.storeName || req.body.storename || req.body.store_name;
    const ownerName = req.body.ownerName || req.body.ownername || req.body.owner_name;
    const address = req.body.address;
    const phone = req.body.phone;
    const pincode = req.body.pincode || req.body.pin || req.body.postal;
    const email = req.body.email;
    const password = req.body.password;
    const idType = req.body.idType || req.body.idtype || "Aadhar";
    const storeType = req.body.storeType || req.body.storetype || "Individual";

    // Basic validations
    if (!storeName || !ownerName || !email || !password) {
      console.warn("Missing required fields");
      return res.status(400).json({ error: "Missing required fields. Required: storeName, ownerName, email, password" });
    }

    // Check duplicate email
    const existing = await Seller.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // File url (if uploaded)
    const idDocUrl = req.file ? `/uploads/seller_docs/${req.file.filename}` : null;

    // Create seller doc
    const newSeller = new Seller({
      storeType,
      storeName,
      name: ownerName,
      address,
      phone,
      pincode,
      email,
      password: hashed,
      status: "pending",
      role: "seller",
      idDocument: { type: idType, url: idDocUrl },
    });

    await newSeller.save();

    console.log("✅ New seller registered:", newSeller._id);
    return res.status(201).json({
      message: "Registration submitted. Waiting for admin approval.",
      sellerId: newSeller._id,
      status: newSeller.status,
    });
  } catch (err) {
    console.error("❌ public seller register error:", err);
    // Send error message (but be careful not to leak stack in production)
    return res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

module.exports = router;
