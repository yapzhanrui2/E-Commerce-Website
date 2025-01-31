const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// All routes in this file require authentication
router.use(verifyToken);

// Protected routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router; 