const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockProducts,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: 'placed' }),
    Order.countDocuments({ orderStatus: 'delivered' }),
    Order.countDocuments({ orderStatus: 'cancelled' }),
    Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
  ]);

  // Total revenue
  const revenueData = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);
  const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

  // Monthly revenue for chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(5);

  // Top selling products
  const topProducts = await Product.find({ isActive: true })
    .sort('-soldCount')
    .limit(5)
    .select('name images price soldCount ratings');

  // Order status breakdown
  const orderStatusBreakdown = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        lowStockProducts,
      },
      monthlyRevenue,
      recentOrders,
      topProducts,
      orderStatusBreakdown,
    },
  });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { role: 'customer' };
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter).sort('-createdAt').skip(skip).limit(limit);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: users,
  });
});

// @desc    Get user details with order history (admin)
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const orders = await Order.find({ user: req.params.id })
    .sort('-createdAt')
    .limit(10);

  const totalSpent = await Order.aggregate([
    { $match: { user: user._id, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  res.json({
    success: true,
    data: {
      user,
      orders,
      totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0,
    },
  });
});

// @desc    Toggle user active status (admin)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot modify admin accounts');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `User account ${user.isActive ? 'activated' : 'deactivated'}`,
    data: user,
  });
});

// @desc    Get sales report
// @route   GET /api/admin/reports
// @access  Admin
const getReports = asyncHandler(async (req, res) => {
  const { period = 'monthly', year = new Date().getFullYear() } = req.query;

  let groupBy;
  let matchCondition = {};

  if (period === 'daily') {
    const startDate = new Date(req.query.startDate || new Date().setDate(1));
    const endDate = new Date(req.query.endDate || new Date());
    matchCondition.createdAt = { $gte: startDate, $lte: endDate };
    groupBy = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' },
    };
  } else if (period === 'monthly') {
    matchCondition.createdAt = {
      $gte: new Date(year, 0, 1),
      $lte: new Date(year, 11, 31),
    };
    groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
  } else {
    groupBy = { year: { $year: '$createdAt' } };
  }

  const salesData = await Order.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: groupBy,
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: '$totalPrice' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  // Best selling products
  const bestSelling = await Product.find({ isActive: true })
    .sort('-soldCount')
    .limit(10)
    .select('name brand price soldCount ratings');

  // Category revenue
  const categoryRevenue = await Order.aggregate([
    { $match: matchCondition },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmpty: true } },
    {
      $group: {
        _id: '$product.category',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        unitsSold: { $sum: '$items.quantity' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmpty: true } },
    { $sort: { revenue: -1 } },
  ]);

  res.json({
    success: true,
    data: { salesData, bestSelling, categoryRevenue },
  });
});

module.exports = {
  getDashboard,
  getUsers,
  getUserDetails,
  toggleUserStatus,
  getReports,
};
