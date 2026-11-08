const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
    path: 'products',
    select: 'name images price discountPrice ratings numReviews stock isActive',
    populate: { path: 'category', select: 'name' },
  });

  if (!wishlist) {
    return res.json({ success: true, data: { products: [] } });
  }

  // Filter out inactive products
  const activeProducts = wishlist.products.filter((p) => p.isActive);

  res.json({ success: true, data: { products: activeProducts } });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
  } else {
    if (wishlist.products.includes(productId)) {
      return res.json({ success: true, message: 'Product already in wishlist' });
    }
    wishlist.products.push(productId);
    await wishlist.save();
  }

  res.json({ success: true, message: 'Added to wishlist' });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  wishlist.products = wishlist.products.filter(
    (p) => p.toString() !== req.params.productId
  );

  await wishlist.save();

  res.json({ success: true, message: 'Removed from wishlist' });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  const isWishlisted = wishlist
    ? wishlist.products.some((p) => p.toString() === req.params.productId)
    : false;

  res.json({ success: true, data: { isWishlisted } });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
};
