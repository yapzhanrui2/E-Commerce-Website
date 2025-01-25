const User = require('../models/user.model');

exports.getProfile = async (req, res) => {
    try {
        // req.user is already set by the auth middleware
        res.status(200).json({
            message: "Profile retrieved successfully",
            user: req.user
        });
    } catch (error) {
        console.error('Profile retrieval error:', error);
        res.status(500).json({
            message: "Error retrieving profile",
            error: error.message
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.user.id;

        // Update user
        await User.update(
            { username, email },
            { where: { id: userId } }
        );

        // Fetch updated user
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            message: "Error updating profile",
            error: error.message
        });
    }
}; 