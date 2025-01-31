const express = require('express');
const router = express.Router();
const { 
    addToCart, 
    getCart, 
    updateCartItem, 
    removeFromCart 
} = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// All cart routes require authentication
router.use(verifyToken);

// Cart routes
router.get('/', getCart);                        // Get user's cart
router.post('/items', addToCart);                // Add item to cart
router.put('/items/:itemId', updateCartItem);    // Update item quantity
router.delete('/items/:itemId', removeFromCart); // Remove item from cart

module.exports = router; 