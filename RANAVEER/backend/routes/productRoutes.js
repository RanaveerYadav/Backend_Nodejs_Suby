const express = require("express");
const productController = require("../controllers/productController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

router.post(
  "/add-product/:firmId",
  verifyToken,
  productController.addProduct
);

router.get(
  "/:firmId/product",
  verifyToken,
  productController.getProductByFirm
);

router.delete(
  "/:productId",
  verifyToken,
  productController.deleteProductById
);

module.exports = router;
