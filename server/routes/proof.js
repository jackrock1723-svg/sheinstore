// routes/proof.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/proofs/:filename
router.get("/:filename", authMiddleware(["admin"]), (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Proof not found" });
  }

  res.sendFile(filePath);
});

module.exports = router;
