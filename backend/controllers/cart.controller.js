const CartItem = require('../models/cart.model');
const Product = require('../models/product.model');

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user.id;  // From auth middleware

        // Validate product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        console.log('Found product:', product.toJSON());

        // Check if item already exists in cart
        let cartItem = await CartItem.findOne({
            where: {
                userId,
                productId
            }
        });

        if (cartItem) {
            // Update quantity if item exists
            cartItem = await cartItem.update({
                quantity: cartItem.quantity + quantity
            });
        } else {
            // Create new cart item
            cartItem = await CartItem.create({
                userId,
                productId,
                quantity
            });
        }
        console.log('Cart item created/updated:', cartItem.toJSON());

        // Fetch the cart item with product details
        const cartItemWithProduct = await CartItem.findByPk(cartItem.id, {
            include: [{
                model: Product,
                attributes: ['name', 'price', 'image'],
                required: true
            }]
        });
        console.log('Cart item with product:', cartItemWithProduct ? cartItemWithProduct.toJSON() : 'Not found');

        if (!cartItemWithProduct || !cartItemWithProduct.Product) {
            // Try an alternative query to debug
            const alternativeQuery = await CartItem.findOne({
                where: { id: cartItem.id },
                include: [{ 
                    model: Product,
                    required: true
                }]
            });
            console.log('Alternative query result:', alternativeQuery ? alternativeQuery.toJSON() : 'Not found');
        }

        res.status(201).json({
            message: "Item added to cart successfully",
            cartItem: cartItemWithProduct
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            message: "Error adding item to cart",
            error: error.message
        });
    }
};

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [{
                model: Product,
                attributes: ['name', 'price', 'image']
            }]
        });

        res.status(200).json({
            message: "Cart retrieved successfully",
            cartItems
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            message: "Error retrieving cart",
            error: error.message
        });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { itemId } = req.params;
        const userId = req.user.id;

        // Validate quantity
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive integer"
            });
        }

        // Find cart item
        const cartItem = await CartItem.findOne({
            where: {
                id: itemId,
                userId
            }
        });

        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found"
            });
        }

        // Update quantity
        await cartItem.update({ quantity });

        // Fetch updated cart item with product details
        const updatedCartItem = await CartItem.findByPk(cartItem.id, {
            include: [{
                model: Product,
                attributes: ['name', 'price', 'image']
            }]
        });

        res.status(200).json({
            message: "Cart item updated successfully",
            cartItem: updatedCartItem
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            message: "Error updating cart item",
            error: error.message
        });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        const cartItem = await CartItem.findOne({
            where: {
                id: itemId,
                userId
            }
        });

        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found"
            });
        }

        await cartItem.destroy();

        res.status(200).json({
            message: "Item removed from cart successfully"
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            message: "Error removing item from cart",
            error: error.message
        });
    }
}; 