const Firm = require("../models/Firm");
const Product = require("../models/product");

const getPublicFirms = async (req, res) => {
  try {
    const firms = await Firm.find().sort({ _id: -1 }).select("firmname area category region offer image");
    res.status(200).json({ firms });
  } catch (error) { console.error(error); res.status(500).json({ error: "Internal Server Error" }); }
};

const getPublicProducts = async (req, res) => {
  try {
    const firm = await Firm.findById(req.params.firmId).select("firmname");
    if (!firm) return res.status(404).json({ error: "Firm not found" });
    const products = await Product.find({ firm: firm._id }).sort({ _id: -1 });
    res.status(200).json({ restaurantName: firm.firmname, products });
  } catch (error) { console.error(error); res.status(500).json({ error: "Internal Server Error" }); }
};

module.exports = { getPublicFirms, getPublicProducts };
