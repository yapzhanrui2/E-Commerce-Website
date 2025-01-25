const { Op } = require('sequelize');
const Product = require('../models/product.model');

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, image, categories } = req.body;

        // Validate required fields
        if (!name || !price) {
            return res.status(400).json({
                message: "Validation error",
                errors: {
                    name: !name ? "Name is required" : null,
                    price: !price ? "Price is required" : null
                }
            });
        }

        // Validate price is a positive number
        if (typeof price !== 'number' || price < 0) {
            return res.status(400).json({
                message: "Validation error",
                errors: {
                    price: "Price must be a positive number"
                }
            });
        }

        const product = await Product.create({
            name,
            description,
            price,
            image,
            categories
        });

        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        // If it's a Sequelize validation error, return 400
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors.reduce((acc, err) => {
                    acc[err.path] = err.message;
                    return acc;
                }, {})
            });
        }

        console.error('Product creation error:', error);
        res.status(500).json({
            message: "Error creating product",
            error: error.message
        });
    }
};

// Get all products with optional filtering
exports.getProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let whereClause = {};

        if (category) {
            whereClause.categories = {
                [Op.contains]: [category]
            };
        }

        if (search) {
            whereClause.name = {
                [Op.iLike]: `%${search}%`
            };
        }

        const products = await Product.findAll({ where: whereClause });
        res.status(200).json({
            message: "Products retrieved successfully",
            products
        });
    } catch (error) {
        console.error('Products retrieval error:', error);
        res.status(500).json({
            message: "Error retrieving products",
            error: error.message
        });
    }
};

// Get a single product by ID
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product retrieved successfully",
            product
        });
    } catch (error) {
        console.error('Product retrieval error:', error);
        res.status(500).json({
            message: "Error retrieving product",
            error: error.message
        });
    }
};

// Update a product
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, image, categories } = req.body;
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        await product.update({
            name,
            description,
            price,
            image,
            categories
        });

        res.status(200).json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error('Product update error:', error);
        res.status(500).json({
            message: "Error updating product",
            error: error.message
        });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        await product.destroy();
        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error('Product deletion error:', error);
        res.status(500).json({
            message: "Error deleting product",
            error: error.message
        });
    }
}; 
