const express = require("express");
const { getPublicFirms, getPublicProducts } = require("../controllers/customerBrowseController");
const router = express.Router();
router.get("/firms", getPublicFirms);
router.get("/firms/:firmId/products", getPublicProducts);
module.exports = router;
