const express = require("express");
const axios = require("axios");
const router = express.Router();

// Get products from Shopify
router.get("/products", async (req, res) => {
  try {
    console.log("🔍 Shopify domain:", process.env.SHOPIFY_SHOP_DOMAIN);
    console.log("🔑 Shopify token:", process.env.SHOPIFY_ADMIN_TOKEN ? "Loaded ✅" : "Missing ❌");

    const response = await axios.get(
      `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data.products);
  } catch (err) {
    console.error("Shopify fetch error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

let cachedRandom = {
  ts: 0,
  items: []
};
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

router.get("/products/random", async (req, res) => {
  try {
    const now = Date.now();
    if (cachedRandom.items.length && (now - cachedRandom.ts) < CACHE_TTL_MS) {
      return res.json(cachedRandom.items);
    }

    const response = await axios.get(
      `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/products.json`,
      { headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN } }
    );

    const all = Array.isArray(response.data.products) ? response.data.products : [];
    const pick = shuffle(all).slice(0, 9);

    cachedRandom.items = pick;
    cachedRandom.ts = now;

    res.json(pick);
  } catch (err) {
    console.error("Shopify fetch/random error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch random products" });
  }
});

module.exports = router;
