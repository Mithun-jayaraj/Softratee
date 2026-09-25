const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/razorpay-controller');
const { protect, customer } = require('../middleware/auth-middleware');
router.post('/create-order', protect, customer, createRazorpayOrder);
router.post('/verify', protect, customer, verifyRazorpayPayment);
module.exports = router;
