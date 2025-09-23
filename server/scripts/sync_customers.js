// scripts/sync_customers.js
require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const Seller = require("../models/seller");

async function syncCustomers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Connected to MongoDB");

    const url = `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/customers.json?limit=250`;

    const res = await axios.get(url, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        "Content-Type": "application/json",
      },
    });

    const customers = res.data.customers;

    console.log(`📥 Fetched ${customers.length} customers from Shopify`);

    for (const c of customers) {
      if ((c.tags || "").toLowerCase().includes("seller")) {
        await Seller.findOneAndUpdate(
          { email: c.email },
          {
            $set: {
              name: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
              email: c.email,
              phone: c.phone || "",
              shopifyCustomerId: String(c.id),
              shopDomain: process.env.SHOPIFY_SHOP_DOMAIN,
              status: "pending", // or "approved"
            },
          },
          { upsert: true, new: true }
        );
        console.log(`✅ Synced seller: ${c.email}`);
      }
    }

    console.log("🎉 Sync completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Sync error:", err.message);
    process.exit(1);
  }
}

syncCustomers();
