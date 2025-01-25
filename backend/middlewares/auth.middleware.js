const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        // Extract token from Bearer header
        const token = authHeader.split(' ')[1];

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user from decoded token
            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] } // Exclude password from user object
            });

            if (!user) {
                return res.status(401).json({
                    message: "User not found"
                });
            }

            // Add user info to request object
            req.user = user;
            next();

        } catch (error) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            message: "Error authenticating user"
        });
    }
};

// Middleware factory for role-based access control
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You don't have permission to perform this action"
            });
        }

        next();
    };
};

// Predefined role middleware
const isAdmin = authorize('admin');
const isUser = authorize('user');
const isAdminOrUser = authorize('admin', 'user');

module.exports = {
    verifyToken,
    authorize,
    isAdmin,
    isUser,
    isAdminOrUser
}; 