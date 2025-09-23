// scripts/sync_sellers.js (node)
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const Seller = require('../models/seller');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  let pageInfo = null;
  const limit=250;
  do {
    const res = await axios.get(`https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/customers.json?limit=${limit}${pageInfo?`&page_info=${pageInfo}`:''}`, {
      headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN }
    });
    const customers = res.data.customers || [];
    for (const c of customers) {
      const tags = (c.tags||"").toLowerCase();
      if (tags.includes('seller')) {
        await Seller.findOneAndUpdate(
          { email: c.email },
          {
            $set: {
              name: `${c.first_name||''} ${c.last_name||''}`.trim(),
              email: c.email,
              phone: c.phone || '',
              shopifyCustomerId: String(c.id),
              shopDomain: process.env.SHOPIFY_SHOP_DOMAIN,
              status: "pending"
            }
          },
          { upsert: true }
        );
      }
    }
    // handle pagination from link header if needed (Shopify cursor paging)
    pageInfo = null; // implement cursor logic if more than limit
  } while (pageInfo);
  console.log('sync done');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
