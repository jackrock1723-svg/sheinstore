// Load environment variables
require("dotenv").config();

const axios = require("axios");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");

// Models
const Order = require("./models/order");
const Wallet = require("./models/wallet");
require("./models/seller");
require("./models/product");

// Routes
const adminAuthRoutes = require("./routes/adminAuth");
const adminPanelRoutes = require("./routes/adminPanel");
const orderRoutes = require("./routes/orders");
const sellerRoutes = require("./routes/seller");
const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/product");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const shipmentRoutes = require("./routes/shipment");
const shopifyRoutes = require("./routes/shopify");
const walletRoutes = require("./routes/wallet");
const webhooksRoutes = require("./routes/webhooks");
const publicSellerRoutes = require("./routes/publicSeller");

// Initialize app
const app = express();

// CORS
app.use(cors({
  origin: [
    "https://seller.shienstore.com",
    "https://shienstore.com"
  ],
  credentials: true
}));

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// ------------------ Webhooks ------------------
// raw body parser ONLY for webhooks
app.use("/webhooks", express.raw({ type: "application/json" }), require("./routes/webhooks"));

// after app initialization and uploads static setup

// Add this line:


// ------------------ Middlewares ------------------
app.use(express.json());

// ------------------ Auth/Admin Routes ------------------
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/sellers", adminPanelRoutes);
app.use("/api/shopify", shopifyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/auth", require("./routes/magicAuth"));
app.use("/api/seller/auth", require("./routes/sellerAuth"));
app.use("/api/public-seller", publicSellerRoutes);
app.use('/auth', require('./routes/auth'));
app.use("/api/wallet", require("./routes/wallet"));
app.use("/api/admin/orders", require("./routes/adminOrders"));
app.use("/api/admin", walletRoutes);
app.use("/api/seller", require("./routes/seller"));









// ------------------ AI-powered chat route ------------------
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    let aiResponse = "";

    if (message.toLowerCase().includes("products")) {
      const shopifyRes = await axios.get(
        `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/products.json`,
        {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      const products = shopifyRes.data.products.slice(0, 5);
      aiResponse =
        "Here are some products I found:\n\n" +
        products
          .map((p) => `🛍️ ${p.title} - $${p.variants?.[0]?.price}`)
          .join("\n");
    } else {
      const ai = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: message }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      aiResponse = ai.data.choices[0].message.content;
    }

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error("❌ Chat error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI chat failed" });
  }
});

// ------------------ MongoDB connection ------------------
console.log("Mongo URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

console.log("✅ Models loaded: Seller, Product");

// ------------------ Ensure uploads folder ------------------
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use("/uploads", express.static(uploadsDir));

// ------------------ Cron job for shipments ------------------
cron.schedule("*/1 * * * *", async () => {
  console.log("⏰ Cron job running...");

  try {
    const now = new Date();

    // 1️⃣ shipped → in_transit after 1 hour
    const toTransit = await Order.find({
      status: "shipped",
      "shipment.shippedAt": { $lte: new Date(now - 1000 * 60 * 60) }, // >1 hour
    });

    for (const order of toTransit) {
      order.status = "in_transit";
      order.shipment.inTransitAt = new Date();
      await order.save();
      console.log(`🚚 Order ${order._id} moved to in_transit`);
    }

    // 2️⃣ in_transit → delivered after 2 days
    const toDelivered = await Order.find({
      status: "in_transit",
      "shipment.inTransitAt": {
        $lte: new Date(now - 1000 * 60 * 60 * 24 * 2), // >2 days
      },
    });

    for (const order of toDelivered) {
      order.status = "delivered";
      order.shipment.deliveredAt = new Date();
      await order.save();
      console.log(`📦 Order ${order._id} delivered`);

      // 3️⃣ Credit seller wallet
      const total = Number(order.price || 0) + Number(order.earn || 0);
      let wallet = await Wallet.findOne({ ownerId: order.sellerId });

      if (!wallet) {
        wallet = new Wallet({
          ownerId: order.sellerId,
          balance: 0,
          history: [],
        });
      }

      wallet.balance += total;
      wallet.history.push({
        type: "credit",
        amount: total,
        note: `Order delivered: ${order._id}`,
        date: new Date(),
      });

      await wallet.save();
      console.log(`💰 Credited ₹${total} to seller ${order.sellerId}'s wallet`);
    }
  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ------------------ Other Routes ------------------
app.use("/api/seller", sellerRoutes);
app.use("/api/product", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/shipment", shipmentRoutes);
app.use("/api/orders", orderRoutes);

// ------------------ Default route ------------------
app.get("/", (req, res) => {
  res.send("Backend working 🚀");
});

// Ensure all errors still return CORS headers
app.use((err, req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // or allowedOrigins[0] if you want strict
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (err instanceof Error) {
    console.error("❌ Global error handler:", err.message);
    return res.status(500).json({ error: err.message });
  }

  next();
});


// ------------------ Start server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
