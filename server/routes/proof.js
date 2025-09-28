// routes/proof.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/proofs/:filename
router.get("/:filename", authMiddleware(["admin", "seller"]), (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Proof not found" });
  }

  res.sendFile(filePath);
});

module.exports = router;
