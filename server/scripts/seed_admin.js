// scripts/seed_admin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Seller = require("../models/seller");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = "shein@store.com";
    const password = "AdminPass123!";
    const hashedPassword = await bcrypt.hash(password, 10);

    let admin = await Seller.findOne({ email, role: "admin" });

    if (!admin) {
      admin = new Seller({
        name: "Super Admin",
        email,
        password: hashedPassword,
        role: "admin", // ✅ Important
        status: "approved", // so it's active
      });

      await admin.save();
      console.log("✅ Admin created:", email, "password:", password);
    } else {
      console.log("ℹ️ Admin already exists:", email);
    }

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    mongoose.disconnect();
  }
}

createAdmin();
