// scripts/seed_admin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Seller = require("../models/seller"); // 👈 FIXED path

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashed = await bcrypt.hash("AdminPass123!", 10);

    const admin = await Seller.findOneAndUpdate(
      { email: "shein@store.com" },
      {
        name: "Super Admin",
        email: "shein@store.com",
        password: hashed,
        role: "admin",
        status: "approved",
      },
      { upsert: true, new: true }
    );

    console.log("✅ Admin seeded:", admin);
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
})();
