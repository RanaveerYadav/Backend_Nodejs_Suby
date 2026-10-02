const express = require("express");

const {
    customerRegisterRequest,
    customerRegisterVerify,
    customerLoginRequest,
    customerLoginVerify,
    getCustomerProfile
} = require("../controllers/customerController");

const customerAuth = require("../middleware/customerAuth");

const router = express.Router();

console.log("CUSTOMER ROUTES LOADED");

// ===============================
// CUSTOMER REGISTER
// ===============================

router.post(
    "/register/request-otp",
    customerRegisterRequest
);

router.post(
    "/register/verify-otp",
    customerRegisterVerify
);

// ===============================
// CUSTOMER LOGIN
// ===============================

router.post(
    "/login/request-otp",
    customerLoginRequest
);

router.post(
    "/login/verify-otp",
    customerLoginVerify
);

// ===============================
// CUSTOMER PROFILE
// ===============================

router.get(
    "/profile",
    customerAuth,
    getCustomerProfile
);

module.exports = router;