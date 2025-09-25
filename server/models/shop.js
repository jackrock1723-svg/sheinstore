const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  accessToken: { type: String }, // if using Shopify API
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Shop", shopSchema);
