const express = require("express");
const verifyCustomerToken = require("../middlewares/verifyCustomerToken");
const { createOrder, getCustomerOrders } = require("../controllers/orderController");
const router = express.Router();
router.use(verifyCustomerToken);
router.post("/", createOrder);
router.get("/my-orders", getCustomerOrders);
module.exports = router;
