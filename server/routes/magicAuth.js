const express = require("express");
const jwt = require("jsonwebtoken");
const Seller = require("../models/seller");

const router = express.Router();

// GET /auth/magic-login?shop=xxx&email=xxx
router.get("/magic-login", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).send("Missing email");

    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).send("Seller not found");

    // create seller JWT
    const token = jwt.sign(
      { id: seller._id, role: "seller" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/merchant?token=${token}`);
  } catch (err) {
    console.error("magic login error", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
