const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');

const SHIPPING_RATES = {
  Colombo: 150,
  Gampaha: 200,
  Kalutara: 250,
  Kandy: 350,
  Matale: 400,
  NuwaraEliya: 400,
  Galle: 300,
  Matara: 350,
  Hambantota: 400,
  Jaffna: 500,
  Kilinochchi: 500,
  Mannar: 500,
  Vavuniya: 450,
  Mullaitivu: 550,
  Batticaloa: 450,
  Ampara: 400,
  Trincomalee: 400,
  Kurunegala: 300,
  Puttalam: 350,
  Anuradhapura: 400,
  Polonnaruwa: 400,
  Badulla: 400,
  Monaragala: 450,
  Ratnapura: 300,
  Kegalle: 300,
};
const DEFAULT_SHIPPING = 350;
const FREE_SHIPPING_THRESHOLD = 5000;

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Server-side stock and price validation
  const orderItems = [];
  let itemsPrice = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    if (!product || !product.isActive) {
      res.status(400);
      throw new Error(`Product "${item.product.name}" is no longer available`);
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(
        `Insufficient stock for "${product.name}". Only ${product.stock} units available.`
      );
    }

    const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    const image = product.images && product.images.length > 0 ? product.images[0].url : '';

    orderItems.push({
      product: product._id,
      name: product.name,
      image,
      price: effectivePrice,
      quantity: item.quantity,
    });

    itemsPrice += effectivePrice * item.quantity;
  }

  // Shipping calculation
  const district = shippingAddress.district || '';
  const shippingPrice =
    itemsPrice >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_RATES[district] || DEFAULT_SHIPPING;

  // Coupon validation
  let discountAmount = 0;
  let appliedCouponCode = null;

  if (couponCode || cart.coupon) {
    let coupon;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    } else {
      coupon = await Coupon.findById(cart.coupon);
    }

    if (coupon && coupon.isValid() && !coupon.usedBy.includes(req.user._id)) {
      if (itemsPrice >= coupon.minOrderAmount) {
        discountAmount = coupon.calcDiscount(itemsPrice);
        appliedCouponCode = coupon.code;

        // Mark coupon as used
        coupon.usedBy.push(req.user._id);
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
  }

  const totalPrice = itemsPrice + shippingPrice - discountAmount;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    itemsPrice,
    shippingPrice,
    discountAmount,
    couponCode: appliedCouponCode,
    totalPrice,
    statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
  });

  // Deduct stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], coupon: null, couponDiscount: 0 }
  );

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
});

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: orders,
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check ownership or admin
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, data: order });
});

// @desc    Cancel order (customer)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (!['placed', 'processing'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error('Order cannot be cancelled at this stage');
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  order.orderStatus = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by customer' });
  await order.save();

  res.json({ success: true, message: 'Order cancelled successfully', data: order });
});

// ==== ADMIN ROUTES ====

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.search) {
    filter.$or = [
      { orderNumber: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email phone')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: orders,
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (orderStatus) {
    order.orderStatus = orderStatus;
    order.statusHistory.push({ status: orderStatus, note: note || `Status updated to ${orderStatus}` });

    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
      }
    }
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  await order.save();

  res.json({
    success: true,
    message: 'Order updated successfully',
    data: order,
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
