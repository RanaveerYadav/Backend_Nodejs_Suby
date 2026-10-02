const express = require('express');
const vendorController = require('../controllers/vendorController');
const router = express.Router();
router.post('/register/request-otp', vendorController.vendorRegisterRequest);
router.post('/register/verify-otp', vendorController.vendorRegisterVerify);
router.post('/login/request-otp', vendorController.vendorLoginRequest);
router.post('/login/verify-otp', vendorController.vendorLoginVerify);
router.get('/single-vendor/:vendorId', vendorController.getVendorById);
module.exports = router;
