const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getCart).post(addToCart).delete(clearCart);
router.route('/:itemId').put(updateCartItem).delete(removeFromCart);
router.post('/coupon/apply', applyCoupon);
router.delete('/coupon/remove', removeCoupon);

module.exports = router;
