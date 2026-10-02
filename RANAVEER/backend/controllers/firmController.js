const Firm = require("../models/Firm");
const Vendor = require("../models/Vendor");
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

async function addFirm(req, res) {
  try {
    const { firmname, area, category, region, offer } = req.body;

    if (!String(firmname || "").trim() || !String(area || "").trim()) {
      return res.status(400).json({ error: "Firm name and area are required" });
    }

    const vendor = await Vendor.findById(req.vendorId);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    const firm = await Firm.create({
      firmname: String(firmname).trim(),
      area: String(area).trim(),
      category: category ? [category] : [],
      region: region ? [region] : [],
      offer: String(offer || "").trim(),
      image: req.file?.filename || "",
      vendor: [vendor._id],
      product: []
    });

    await Vendor.findByIdAndUpdate(vendor._id, {
      $addToSet: { firm: firm._id }
    });

    return res.status(201).json({
      message: "Firm Added Successfully",
      firm
    });
  } catch (error) {
    console.error("ADD FIRM ERROR:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Firm name already exists" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getFirmsByVendor(req, res) {
  try {
    if (String(req.vendorId) !== String(req.params.vendorId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const firms = await Firm.find({ vendor: req.vendorId })
      .sort({ createdAt: -1, _id: -1 });

    return res.status(200).json({ firms });
  } catch (error) {
    console.error("GET VENDOR FIRMS ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteFirmById(req, res) {
  try {
    const firm = await Firm.findOneAndDelete({
      _id: req.params.firmId,
      vendor: req.vendorId
    });

    if (!firm) return res.status(404).json({ error: "No Firm Found" });

    await Vendor.findByIdAndUpdate(req.vendorId, {
      $pull: { firm: firm._id }
    });

    return res.status(200).json({ message: "Firm Deleted Successfully" });
  } catch (error) {
    console.error("DELETE FIRM ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  addFirm: [upload.single("image"), addFirm],
  getFirmsByVendor,
  deleteFirmById
};
