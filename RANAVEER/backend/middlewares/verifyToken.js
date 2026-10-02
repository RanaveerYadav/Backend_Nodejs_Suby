const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const token = req.headers.token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Token is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const vendor = await Vendor.findById(decoded.vendorId);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    req.vendorId = vendor._id;
    next();
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ error: "Invalid Token" });
  }
};

module.exports = verifyToken;
