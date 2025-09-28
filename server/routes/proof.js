// routes/proof.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:filename", authMiddleware(["admin", "seller"]), (req, res) => {
  // Ensure correct folder (adjust if needed)
  const filePath = path.join(__dirname, "../uploads", req.params.filename);

  if (!fs.existsSync(filePath)) {
    console.error("❌ Proof not found at:", filePath);
    return res.status(404).json({ error: "Proof not found" });
  }

  res.sendFile(filePath);
});

module.exports = router;
