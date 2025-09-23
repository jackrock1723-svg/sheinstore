// routes/webhooks.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Seller = require("../models/seller");

// helper to verify webhook HMAC
function verifyShopifyWebhook(req, res, buf) {
  const secret = process.env.SHOPIFY_SECRET; // Shopify app secret
  const hmac = req.get("X-Shopify-Hmac-Sha256");
  const digest = crypto.createHmac("sha256", secret).update(buf).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}
router.use((req, res, next) => {
  console.log("📥 Webhook hit:", req.method, req.originalUrl);
  next();
});


// ----------------- CREATE -----------------
router.post("/create", async (req, res) => {
  try {
    const raw = req.body; // raw buffer (express.raw used)
    console.log("📥 RAW body:", raw.toString());
    if (!verifyShopifyWebhook(req, res, raw)) return res.status(401).send("Invalid signature");

    const data = JSON.parse(raw.toString());
    const email = data.email;
    const shopDomain = req.get("X-Shopify-Shop-Domain");

    // only create seller if tag 'seller' exists
    const tags = (data.tags || "").toLowerCase();
    if (!tags.includes("seller")) return res.status(200).send("Not a seller — ignored");

    const doc = {
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      email,
      phone: data.phone || "",
      shopifyCustomerId: String(data.id),
      shopDomain,
      status: "pending"
    };

    await Seller.findOneAndUpdate({ email }, { $set: doc }, { upsert: true, new: true });
    res.status(200).send("OK");
  } catch (err) {
    console.error("webhook create error", err);
    res.status(500).send("Error");
  }
});

// ----------------- UPDATE -----------------
router.post("/update", async (req, res) => {
  try {
    const raw = req.body;
    if (!verifyShopifyWebhook(req, res, raw)) return res.status(401).send("Invalid signature");

    const data = JSON.parse(raw.toString());
    const email = data.email;
    const tags = (data.tags || "").toLowerCase();
    const shopDomain = req.get("X-Shopify-Shop-Domain");

    if (tags.includes("seller")) {
      await Seller.findOneAndUpdate(
        { email },
        {
          $set: {
            name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            phone: data.phone || "",
            shopifyCustomerId: String(data.id),
            shopDomain
          }
        },
        { upsert: true, new: true }
      );
    } else {
      await Seller.findOneAndUpdate({ email }, { $set: { status: "rejected" } });
    }
    res.status(200).send("OK");
  } catch (err) {
    console.error("webhook update error", err);
    res.status(500).send("Error");
  }
});

// ----------------- DELETE -----------------
router.post("/delete", async (req, res) => {
  try {
    const raw = req.body;
    if (!verifyShopifyWebhook(req, res, raw)) return res.status(401).send("Invalid signature");

    const data = JSON.parse(raw.toString());
    const email = data.email;

    await Seller.findOneAndUpdate({ email }, { $set: { status: "rejected" } });
    res.status(200).send("OK");
  } catch (err) {
    console.error("webhook delete error", err);
    res.status(500).send("Error");
  }
});

module.exports = router;
