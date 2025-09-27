const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Seller = require("../models/seller");
const querystring = require('querystring');
const Shop = require('../models/shop');




// Build install URL and redirect merchant to Shopify
router.get('/install', (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Missing shop param');

  const state = crypto.randomBytes(8).toString('hex');
  // save state -> you can store in a short in-memory map keyed by shop or use DB/redis
  // e.g. tempStateStore[shop] = state;

  const redirectUri = `${process.env.BACKEND_URL}/auth/callback`;
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products';

  const installUrl = `https://${shop}/admin/oauth/authorize?` + querystring.stringify({
    client_id: process.env.SHOPIFY_API_KEY,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
    'grant_options[]': 'per-user' // optional: online access
  });

  res.redirect(installUrl);
});

// OAuth callback: exchange code for access token
router.get('/callback', async (req, res) => {
  try {
    const { shop, code, state } = req.query;
    // validate state with saved state for this shop
    // if (state !== tempStateStore[shop]) return res.status(403).send('Invalid state');

    const tokenResponse = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const scopes = tokenResponse.data.scope;

    // Save shop & token into DB (create or update)
    await Shop.findOneAndUpdate(
      { shopDomain: shop },
      { shopDomain: shop, accessToken, scopes },
      { upsert: true }
    );

    // After installation, redirect merchant into your app UI (top-level).
    // If embedded, you will need to top-level redirect to the app inside Shopify admin using App Bridge.
    const host = req.query.host; // Shopify may provide host param for embedded apps
    // Redirect merchant to your app frontend inside admin (example)
    const frontendAppUrl = `${process.env.FRONTEND_URL}/auth/installed?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
    return res.redirect(frontendAppUrl);
  } catch (err) {
    console.error('OAuth callback error', err.response?.data || err.message);
    res.status(500).send('Auth failed');
  }
});


// 📝 Seller Registration
router.post("/register-seller", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ msg: "Seller already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new seller (status = pending by default)
    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      status: "pending",   // 👈 sellers must be approved by admin
      role: "seller"
    });

    await newSeller.save();

    res.status(201).json({ msg: "Seller registered successfully. Waiting for admin approval." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// // 🔑 Seller & Admin Login
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if seller/admin exists
//     const user = await Seller.findOne({ email });
//     if (!user) return res.status(400).json({ error: "User not found" });

//     // ✅ Block seller if not approved
//     if (user.role === "seller" && user.status !== "approved") {
//       return res.status(403).json({
//         error: `Your account is ${user.status}. Please wait for admin approval.`,
//       });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

//     // Create JWT
//     const token = jwt.sign(
//       { id: user._id, role: user.role || "seller" }, // default role = seller
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({ token, role: user.role || "seller" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;
