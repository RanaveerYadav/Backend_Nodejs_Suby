const express = require("express");
const firmController = require("../controllers/firmController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();
router.post("/add-firm", verifyToken, firmController.addFirm);
router.get("/vendor/:vendorId/firms", verifyToken, firmController.getFirmsByVendor);
router.delete("/:firmId", verifyToken, firmController.deleteFirmById);

module.exports = router;
