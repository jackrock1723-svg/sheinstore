// routes/auth_shopify.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const Seller = require('../models/seller');

router.get('/magic-login', async (req, res) => {
  try {
    const { shop, email, redirectTo } = req.query;
    if (!shop || !email) return res.status(400).send("Missing params");

    // Search customer by email (works with Admin token)
    const q = encodeURIComponent(`email:${email}`);
    const url = `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/customers/search.json?query=${q}`;

    const shopifyRes = await axios.get(url, {
      headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN }
    });

    const customer = (shopifyRes.data.customers || [])[0];
    if (!customer) return res.status(403).send("Customer not found");

    const tags = (customer.tags || "").toLowerCase();
    if (!tags.includes('seller')) {
      return res.status(403).send("Customer not a seller");
    }

    // Upsert seller (auto approve? choose policy)
    const seller = await Seller.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          shopifyCustomerId: String(customer.id),
          name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
          shopDomain: shop,
          status: "approved" // or pending if you want admin approval step
        }
      },
      { upsert: true, new: true }
    );

    // create JWT
    const token = jwt.sign({ id: seller._id, role: 'seller' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Option A: redirect to frontend with token in query (simple)
    const redirect = redirectTo || process.env.FRONTEND_URL + '/merchant';
    return res.redirect(`${redirect}?token=${token}`);

    // Option B: return JSON
    // return res.json({ token });

  } catch (err) {
    console.error("magic login error", err.response?.data || err.message);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
