const Order = require('../models/order');
const Product = require('../models/product');
const Coupon = require('../models/coupon');
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    couponCode
  } = req.body;
  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }
  try {
    let calculatedItemsPrice = 0;
    const verifiedOrderItems = [];
    const mongoose = require('mongoose');
    for (const item of orderItems) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: `Invalid product ID for item: ${item.name}. Please refresh your cart.` });
      }
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}. Please refresh your cart.` });
      }
      if (product.countInStock < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      let itemPrice = product.price;
      calculatedItemsPrice += itemPrice * item.qty;
      verifiedOrderItems.push({
        ...item,
        price: itemPrice 
      });
    }
    let discountPercent = 0;
    let appliedCouponCode = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (coupon && coupon.isActive && new Date(coupon.expiryDate) > new Date()) {
        discountPercent = coupon.discountPercent;
        appliedCouponCode = coupon.code;
      }
    }
    let discountAmount = 0;
    if (discountPercent > 0) {
      discountAmount = calculatedItemsPrice * (discountPercent / 100);
    }
    const discountedSubtotal = calculatedItemsPrice - discountAmount;
    const taxPrice = 0.15 * discountedSubtotal;
    const shippingPrice = discountedSubtotal > 100 ? 0 : 10;
    const totalPrice = discountedSubtotal + taxPrice + shippingPrice;
    const order = new Order({
      orderItems: verifiedOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice: calculatedItemsPrice, 
      couponCode: appliedCouponCode,
      discountAmount: discountAmount,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentStatus: 'Pending',
      orderStatus: 'Placed',
      statusHistory: [{ status: 'Placed' }]
    });
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error creating order: ${error.message}` });
  }
};
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );
    if (order) {
      if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
         res.status(401).json({ message: 'Not authorized to view this order' });
         return;
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
};
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
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
      order.statusHistory.push({ status: 'Paid', date: Date.now() });
      if (req.body.paymentMethod) {
        order.paymentMethod = req.body.paymentMethod;
      }
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error updating order: ${error.message}` });
  }
};
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.orderStatus = 'Delivered';
      order.statusHistory.push({ status: 'Delivered', date: Date.now() });
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating order' });
  }
};
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, carrier } = req.body;
    const validStatuses = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id);
    if (order) {
      order.orderStatus = status;
      order.statusHistory.push({ status, date: Date.now() });
      if (status === 'Shipped') {
        order.shippedAt = Date.now();
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (carrier) order.carrier = carrier;
      }
      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error updating order status: ${error.message}` });
  }
};
module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  updateOrderStatus,
};
