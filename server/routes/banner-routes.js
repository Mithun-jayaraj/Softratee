const express = require('express');
const router = express.Router();
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/banner-controller');
const { protect, admin } = require('../middleware/auth-middleware');
router.route('/').get(getBanners).post(protect, admin, createBanner);
router.route('/:id').put(protect, admin, updateBanner).delete(protect, admin, deleteBanner);
module.exports = router;
