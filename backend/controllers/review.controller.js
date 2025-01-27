const { Review, User, Product } = require('../models');

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id; // Assuming this comes from auth middleware

        // Validate required fields
        if (!productId || !rating) {
            return res.status(400).json({
                message: "Validation error",
                errors: {
                    productId: !productId ? "Product ID is required" : null,
                    rating: !rating ? "Rating is required" : null
                }
            });
        }

        // Validate rating is between 1 and 5
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Validation error",
                errors: {
                    rating: "Rating must be an integer between 1 and 5"
                }
            });
        }

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({
            where: {
                userId,
                productId
            }
        });

        if (existingReview) {
            return res.status(400).json({
                message: "You have already reviewed this product"
            });
        }

        const review = await Review.create({
            productId,
            userId,
            rating,
            comment
        });

        res.status(201).json({
            message: "Review created successfully",
            review
        });
    } catch (error) {
        console.error('Review creation error:', error);
        res.status(500).json({
            message: "Error creating review",
            error: error.message
        });
    }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const reviews = await Review.findAll({
            where: { productId },
            include: [{
                model: User,
                attributes: ['id', 'username'] // Only include safe user fields
            }],
            order: [['createdAt', 'DESC']]
        });

        // Calculate average rating
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        res.status(200).json({
            message: "Reviews retrieved successfully",
            averageRating,
            totalReviews: reviews.length,
            reviews
        });
    } catch (error) {
        console.error('Reviews retrieval error:', error);
        res.status(500).json({
            message: "Error retrieving reviews",
            error: error.message
        });
    }
}; 