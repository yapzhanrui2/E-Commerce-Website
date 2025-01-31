const express = require('express');
const router = express.Router();
const { 
    createCheckoutSession,
    handleStripeWebhook,
    getUserOrders,
    getOrderDetails,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Stripe webhook (needs raw body, so no bodyParser)
router.post('/webhook', handleStripeWebhook);

// Protected routes (require authentication)
router.use(verifyToken);

// User routes
router.post('/checkout', createCheckoutSession);
router.get('/my-orders', getUserOrders);
router.get('/my-orders/:orderId', getOrderDetails);

// Admin routes
router.get('/all', verifyToken, isAdmin, getAllOrders);
router.put('/:orderId/status', verifyToken, isAdmin, updateOrderStatus);

module.exports = router; 