const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, getAllReviews);
router.post('/', protect, createReview);
router.get('/:productId', getProductReviews);
router.route('/:id').put(protect, updateReview).delete(protect, deleteReview);

module.exports = router;
