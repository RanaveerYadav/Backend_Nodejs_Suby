const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  firm: { type: mongoose.Schema.Types.ObjectId, ref: "Firm", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["Placed", "Preparing", "Out for delivery", "Delivered", "Cancelled"], default: "Placed" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
