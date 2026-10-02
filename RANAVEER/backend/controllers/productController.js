const Product = require("../models/product");
const Firm = require("../models/Firm");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage });

async function addProduct(req, res) {
  try {
    const { productName, price, category, bestseller, description } = req.body;

    if (!String(productName || "").trim()) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: "Valid product price is required" });
    }

    const firm = await Firm.findOne({
      _id: req.params.firmId,
      vendor: req.vendorId
    });

    if (!firm) {
      return res.status(404).json({
        error: "Firm not found or access denied"
      });
    }

    const product = await Product.create({
      productName: String(productName).trim(),
      price: numericPrice,
      category: category ? [category] : [],
      bestseller: String(bestseller) === "true",
      description: String(description || "").trim(),
      image: req.file?.filename || "",
      firm: [firm._id]
    });

    await Firm.findByIdAndUpdate(firm._id, {
      $addToSet: { product: product._id }
    });

    return res.status(201).json({
      message: "Product Added Successfully",
      product
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getProductByFirm(req, res) {
  try {
    const firm = await Firm.findOne({
      _id: req.params.firmId,
      vendor: req.vendorId
    }).select("firmname");

    if (!firm) {
      return res.status(404).json({
        error: "Firm not found or access denied"
      });
    }

    const products = await Product.find({
      firm: firm._id
    }).sort({ createdAt: -1, _id: -1 });

    return res.status(200).json({
      restaurantName: firm.firmname,
      firmId: firm._id,
      products
    });
  } catch (error) {
    console.error("GET VENDOR PRODUCTS ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteProductById(req, res) {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ error: "No Product Found" });
    }

    const firm = await Firm.findOne({
      _id: { $in: product.firm },
      vendor: req.vendorId
    });

    if (!firm) return res.status(403).json({ error: "Access denied" });

    await Product.findByIdAndDelete(product._id);

    await Firm.findByIdAndUpdate(firm._id, {
      $pull: { product: product._id }
    });

    return res.status(200).json({
      message: "Product Deleted Successfully"
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  addProduct: [upload.single("image"), addProduct],
  getProductByFirm,
  deleteProductById
};
