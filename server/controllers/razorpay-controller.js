const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/order');
const Product = require('../models/product');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (order.isPaid || order.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }
    const amountInPaise = Math.round(order.totalPrice * 100);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_order_${order._id}`,
    };
    const razorpayOrder = await razorpay.orders.create(options);
    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    let hmac = crypto.createHmac('sha256', key_secret); 
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
    if (!order.isPaid) {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          if (product.countInStock < item.qty) {
             return res.status(400).json({ message: `Insufficient stock for ${product.name} to complete order.` });
          }
          await Product.updateOne({ _id: product._id }, { $inc: { countInStock: -item.qty } });
        }
      }
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentStatus = 'Paid';
      order.paymentMethod = 'Razorpay';
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'success',
        update_time: new Date().toISOString(),
        email_address: req.user.email,
      };
      order.razorpayOrderId = razorpay_order_id;
      order.razorpayPaymentId = razorpay_payment_id;
      order.statusHistory.push({ status: 'Paid', date: Date.now() });
      const updatedOrder = await order.save();
      return res.json(updatedOrder);
    }
    res.json(order);
  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    res.status(500).json({ message: 'Server error during payment verification' });
  }
};
module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
