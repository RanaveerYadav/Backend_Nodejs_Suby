const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

async function verifyCustomerToken(req, res, next) {
  const token = req.headers.token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Customer token is required" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.customerId) return res.status(401).json({ error: "Invalid customer token" });
    const customer = await Customer.findById(decoded.customerId);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    req.customerId = customer._id;
    req.customer = customer;
    next();
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ error: "Invalid customer token" });
  }
}

module.exports = verifyCustomerToken;
