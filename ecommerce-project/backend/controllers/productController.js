const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments({ isActive: true });

  const features = new APIFeatures(
    Product.find({ isActive: true }).populate('category', 'name slug'),
    req.query
  )
    .search()
    .filter()
    .sort()
    .paginate(12);

  const products = await features.query;

  res.json({
    success: true,
    count: products.length,
    total: totalProducts,
    page: features.currentPage || 1,
    pages: Math.ceil(totalProducts / (features.limit || 12)),
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
    isActive: true,
  }).populate('category', 'name slug');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, data: product });
});

// @desc    Create product (admin)
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    shortDescription,
    price,
    discountPrice,
    category,
    brand,
    stock,
    isFeatured,
    isNewArrival,
    isBestSeller,
    tags,
    specifications,
    images,
  } = req.body;

  const product = await Product.create({
    name,
    description,
    shortDescription,
    price,
    discountPrice: discountPrice || 0,
    category,
    brand,
    stock,
    isFeatured: isFeatured || false,
    isNewArrival: isNewArrival || false,
    isBestSeller: isBestSeller || false,
    tags: tags || [],
    specifications: specifications || [],
    images: images || [],
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

// @desc    Update product (admin)
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
});

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Soft delete
  product.isActive = false;
  await product.save();

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8);

  res.json({ success: true, data: products });
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isNewArrival: true, isActive: true })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(8);

  res.json({ success: true, data: products });
});

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isBestSeller: true, isActive: true })
    .populate('category', 'name slug')
    .sort('-soldCount')
    .limit(8);

  res.json({ success: true, data: products });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .populate('category', 'name slug')
    .limit(4);

  res.json({ success: true, data: relatedProducts });
});

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Admin
const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No images uploaded');
  }

  const images = req.files.map((file) => ({
    url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
    public_id: file.filename,
  }));

  product.images.push(...images);
  await product.save();

  res.json({
    success: true,
    message: 'Images uploaded successfully',
    data: product.images,
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getRelatedProducts,
  uploadProductImages,
};
