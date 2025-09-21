const express = require("express");
const axios = require("axios");
const router = express.Router();

const SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION;

// GET products from Shopify
router.get("/products", async (req, res) => {
  try {
    const response = await axios.get(
      `https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": ADMIN_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("❌ Shopify API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: `https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/products.json`,
      token: ADMIN_TOKEN ? "Present" : "Missing"
    });
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

module.exports = router;
