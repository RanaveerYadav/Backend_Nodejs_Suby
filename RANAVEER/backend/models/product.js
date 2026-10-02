const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: [{ type: String, enum: ["veg", "non-veg"] }],
  image: { type: String },
  bestseller: { type: Boolean, default: false },
  description: { type: String },
  firm: [{ type: mongoose.Schema.Types.ObjectId, ref: "Firm" }]
});

module.exports = mongoose.model("product", productSchema);
