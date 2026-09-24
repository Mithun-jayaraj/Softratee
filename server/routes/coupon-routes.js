const express = require('express');
const router = express.Router();
const {
  getCoupons,
  getAvailableCoupons,
  createCoupon,
  deleteCoupon,
  verifyCoupon,
} = require('../controllers/coupon-controller');
const { protect, admin } = require('../middleware/auth-middleware');
router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);
router.route('/available').get(getAvailableCoupons);
router.route('/verify').post(verifyCoupon);
router.route('/:id').delete(protect, admin, deleteCoupon);
module.exports = router;
