const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                email: email
            }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success response without password
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: "Error registering user",
            error: error.message
        });
    }
}; 

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ where: { email } });

        // Check if user exists and validate password
        if (!user || !(await user.isValidPassword(password))) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success response
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: "Error during login",
            error: error.message
        });
    }
};

// Get current user details
exports.getMe = async (req, res) => {
    try {
        // req.user is already set by verifyToken middleware
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] } // Exclude password from response
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            message: "Error fetching user details",
            error: error.message
        });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        // Since we're using JWT, we don't need to do anything server-side
        // The client should remove the token
        res.status(200).json({
            message: "Logout successful"
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            message: "Error during logout",
            error: error.message
        });
    }
};