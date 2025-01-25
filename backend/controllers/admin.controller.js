const User = require('../models/user.model');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            message: "Users retrieved successfully",
            users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            message: "Error retrieving users",
            error: error.message
        });
    }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({
                message: "Invalid role specified"
            });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await user.update({ role });

        res.status(200).json({
            message: "User role updated successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            message: "Error updating user role",
            error: error.message
        });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Prevent admin from deleting themselves
        if (user.id === req.user.id) {
            return res.status(400).json({
                message: "Cannot delete your own admin account"
            });
        }

        await user.destroy();

        res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            message: "Error deleting user",
            error: error.message
        });
    }
}; 