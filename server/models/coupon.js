const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discountPercent: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);
const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
