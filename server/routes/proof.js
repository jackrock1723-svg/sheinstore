const express = require("express");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ your auth check

const router = express.Router();

// Admin-only route to fetch proof images
router.get("/:filename", authMiddleware(["admin"]), (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "..", "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Proof not found" });
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error("❌ proof route error:", err.message);
    res.status(500).json({ error: "Failed to load proof" });
  }
});

module.exports = router;
