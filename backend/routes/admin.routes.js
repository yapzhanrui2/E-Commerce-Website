const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/admin.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// All routes require authentication and admin role
router.use(verifyToken, isAdmin);

// Admin routes
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

module.exports = router; 