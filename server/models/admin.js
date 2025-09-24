const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, default: "admin" }  // 👈 so JWT knows role
}, { timestamps: true });

module.exports = mongoose.model("Admin", AdminSchema);
