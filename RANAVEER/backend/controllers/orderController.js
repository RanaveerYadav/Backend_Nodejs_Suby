const Order = require("../models/Order");
const Firm = require("../models/Firm");
const Product = require("../models/product");

const createOrder = async (req, res) => {
  try {
    const { firmId, items } = req.body;
    if (!firmId || !Array.isArray(items) || !items.length) return res.status(400).json({ error: "Firm and at least one item are required" });
    const firm = await Firm.findById(firmId);
    if (!firm) return res.status(404).json({ error: "Firm not found" });

    const ids = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: ids }, firm: firm._id });
    if (products.length !== items.length) return res.status(400).json({ error: "One or more products are invalid for this firm" });

    const normalized = items.map(item => {
      const product = products.find(p => String(p._id) === String(item.productId));
      const quantity = Math.max(1, Number(item.quantity) || 1);
      return { product: product._id, productName: product.productName, quantity, price: product.price };
    });
    const totalAmount = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ customer: req.customerId, firm: firm._id, items: normalized, totalAmount });
    const populated = await Order.findById(order._id).populate("firm", "firmname area");
    res.status(201).json({ message: "Order Placed Successfully", order: populated });
  } catch (error) { console.error(error); res.status(500).json({ error: "Internal Server Error" }); }
};

const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.customerId }).populate("firm", "firmname area").sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) { console.error(error); res.status(500).json({ error: "Internal Server Error" }); }
};

module.exports = { createOrder, getCustomerOrders };
