const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const authMiddleware = require("../middleware/authMiddleware");
const axios = require("axios");


// GET all products (admin only, with seller info)
router.get("/all", authMiddleware(["admin"]), async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "name email status"); // shows seller details
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET products from Shopify
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const products = response.data.products.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.variants?.[0]?.price,
      image: p.image?.src,
      createdAt: p.created_at,
      status: "available", // default status for now
    }));

    res.json(products);
  } catch (err) {
    console.error("❌ Shopify fetch error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch products from Shopify" });
  }
});


// DELETE Product (seller or admin)
router.delete("/delete/:id", authMiddleware(["seller", "admin"]), async (req, res) => {
  try {
    let product;

    if (req.user.role === "seller") {
      // Seller can only delete their own product
      product = await Product.findOneAndDelete({
        _id: req.params.id,
        seller: req.user.id
      });
      if (!product) {
        return res.status(404).json({ error: "Product not found or not yours" });
      }
    } else if (req.user.role === "admin") {
      // Admin can delete any product
      product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
    }

    res.json({ message: "Product deleted successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
