const express = require('express');
const router = express.Router();
const { createReview, getProductReviews } = require('../controllers/review.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Create a new review (requires authentication)
router.post('/', verifyToken, createReview);

// Get all reviews for a product (public route)
router.get('/:productId', getProductReviews);

module.exports = router; 