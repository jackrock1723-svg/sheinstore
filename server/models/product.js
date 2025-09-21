const mongoose = require("mongoose");

// Define schema first
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    shipmentPrice: { type: Number, required: true },
    earning: { type: Number, required: true },
  },
  { timestamps: true }
);

// Export safely (avoid OverwriteModelError)
module.exports =
  mongoose.models.product || mongoose.model("product", productSchema);
