// server/routes/webhooks.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Seller = require("../models/seller");

// helper to verify webhook HMAC
function verifyShopifyWebhook(req, rawBodyBuffer) {
  const secret = process.env.SHOPIFY_SECRET;
  if (!secret) {
    // If secret not provided (local/dev), skip verification but log a warning.
    console.warn("⚠️ SHOPIFY_SECRET not set — skipping webhook HMAC verification (dev only).");
    return true;
  }

  const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
  if (!hmacHeader) {
    console.warn("⚠️ No X-Shopify-Hmac-Sha256 header present");
    return false;
  }

  try {
    const digest = crypto
      .createHmac("sha256", secret)
      .update(rawBodyBuffer)
      .digest("base64");

    // timingSafeEqual expects buffers of the same length
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch (err) {
    console.error("HMAC verify error:", err);
    return false;
  }
}

// small helper: normalize tags into lowercase string
function normalizeTags(tags) {
  if (!tags) return "";
  if (Array.isArray(tags)) return tags.map(t => String(t).toLowerCase()).join(", ");
  return String(tags).toLowerCase();
}

// Middleware to log incoming webhook (helps debug)
router.use((req, res, next) => {
  console.log(`📥 Webhook hit: ${req.method} ${req.originalUrl}`);
  next();
});

// ----------------- CREATE -----------------
router.post("/create", async (req, res) => {
  try {
    const raw = req.body; // express.raw used in server.js, so this is a Buffer
    const rawText = raw && raw.toString ? raw.toString() : "{}";
    console.log("📥 RAW body:", rawText);

    // verify signature (unless you intentionally disabled SHOPIFY_SECRET)
    if (!verifyShopifyWebhook(req, raw)) {
      console.warn("Webhook signature verification failed.");
      // If you want to allow dev/test without signature, return next line instead:
      // return res.status(401).send("Invalid signature");
      // For now, deny if secret is set but not valid
      if (process.env.SHOPIFY_SECRET) return res.status(401).send("Invalid signature");
    }

    const data = JSON.parse(rawText);
    const tags = normalizeTags(data.tags);
    console.log("📥 Parsed tags:", tags);

    // only create seller if tag 'seller' exists
    if (!tags.includes("seller")) {
      console.log("Not a seller — ignored");
      return res.status(200).send("Not a seller — ignored");
    }

    const email = data.email;
    const shopDomain = req.get("X-Shopify-Shop-Domain") || data.shop_domain || "";

    const doc = {
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email,
      email,
      phone: data.phone || "",
      shopifyCustomerId: String(data.id || ""),
      shopDomain,
      status: "pending"
    };

    const seller = await Seller.findOneAndUpdate(
      { email },
      { $set: doc },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("✅ Seller upserted:", seller.email);
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
    const rawText = raw && raw.toString ? raw.toString() : "{}";
    console.log("📥 RAW body (update):", rawText);

    if (!verifyShopifyWebhook(req, raw)) {
      console.warn("Webhook signature verification failed (update).");
      if (process.env.SHOPIFY_SECRET) return res.status(401).send("Invalid signature");
    }

    const data = JSON.parse(rawText);
    const tags = normalizeTags(data.tags);
    console.log("📥 Parsed tags (update):", tags);

    const email = data.email;
    const shopDomain = req.get("X-Shopify-Shop-Domain") || data.shop_domain || "";

    if (tags.includes("seller")) {
      const seller = await Seller.findOneAndUpdate(
        { email },
        {
          $set: {
            name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || email,
            phone: data.phone || "",
            shopifyCustomerId: String(data.id || ""),
            shopDomain,
            // keep existing status (admin approval) — do not override
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log("✅ Seller created/updated (update webhook):", seller.email);
    } else {
      // tags do not include seller -> mark as rejected or leave alone
      await Seller.findOneAndUpdate({ email }, { $set: { status: "rejected" } });
      console.log("ℹ️ Customer not a seller any more, status set to rejected (if existed)");
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
    const rawText = raw && raw.toString ? raw.toString() : "{}";
    console.log("📥 RAW body (delete):", rawText);

    if (!verifyShopifyWebhook(req, raw)) {
      console.warn("Webhook signature verification failed (delete).");
      if (process.env.SHOPIFY_SECRET) return res.status(401).send("Invalid signature");
    }

    const data = JSON.parse(rawText);
    const email = data.email;

    await Seller.findOneAndUpdate({ email }, { $set: { status: "rejected" } });
    console.log("✅ Seller marked rejected (delete):", email);
    res.status(200).send("OK");
  } catch (err) {
    console.error("webhook delete error", err);
    res.status(500).send("Error");
  }
});

module.exports = router;
