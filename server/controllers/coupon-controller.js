const Coupon = require('../models/coupon');
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching coupons' });
  }
};
const getAvailableCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: now }
    }).select('code discountPercent expiryDate'); 
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching available coupons' });
  }
};
const createCoupon = async (req, res) => {
  const { code, discountPercent, expiryDate } = req.body;
  try {
    const couponExists = await Coupon.findOne({ code });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon already exists' });
    }
    const coupon = new Coupon({ 
      code, 
      discountPercent, 
      expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
    });
    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating coupon' });
  }
};
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      await Coupon.deleteOne({ _id: coupon._id });
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting coupon' });
  }
};
const verifyCoupon = async (req, res) => {
  const { code } = req.body;
  try {
    const coupon = await Coupon.findOne({ code });
    if (coupon && coupon.isActive && new Date(coupon.expiryDate) > new Date()) {
      res.json(coupon);
    } else {
      res.status(404).json({ message: 'Invalid or expired coupon' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying coupon' });
  }
};
module.exports = {
  getCoupons,
  getAvailableCoupons,
  createCoupon,
  deleteCoupon,
  verifyCoupon,
};
