const { Order, OrderItem, Product, CartItem } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a checkout session
exports.createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user's cart items
        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [{
                model: Product,
                attributes: ['id', 'name', 'price', 'image']
            }]
        });

        console.log('Cart items found:', JSON.stringify(cartItems.map(item => item.toJSON()), null, 2));

        if (!cartItems.length) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // Calculate total amount
        const totalAmount = cartItems.reduce((sum, item) => {
            return sum + (item.Product.price * item.quantity);
        }, 0);

        // Create Stripe line items
        const lineItems = cartItems.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.Product.name,
                    images: item.Product.image ? [item.Product.image] : []
                },
                unit_amount: Math.round(item.Product.price * 100) // Stripe expects amount in cents
            },
            quantity: item.quantity
        }));

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`,
            customer_email: req.user.email,
            metadata: {
                userId: userId.toString()
            }
        });

        console.log('Stripe session created:', session.id);

        // Create order in pending state
        const order = await Order.create({
            userId,
            totalAmount,
            stripeSessionId: session.id,
            shippingAddress: {}, // Will be filled after successful payment
            status: 'pending',
            paymentStatus: 'pending'
        });

        console.log('Order created:', order.toJSON());

        // Create order items
        const orderItems = await Promise.all(cartItems.map(async item => {
            console.log('Creating order item for product:', item.Product.id);
            return OrderItem.create({
                orderId: order.id,
                productId: item.Product.id,
                quantity: item.quantity,
                priceAtTime: item.Product.price
            });
        }));

        console.log('Order items created:', orderItems.map(item => item.toJSON()));

        res.status(200).json({
            message: "Checkout session created",
            sessionId: session.id,
            sessionUrl: session.url
        });
    } catch (error) {
        console.error('Checkout session creation error:', error);
        res.status(500).json({
            message: "Error creating checkout session",
            error: error.message
        });
    }
};

// Handle Stripe webhook
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            
            // Update order status
            const order = await Order.findOne({
                where: { stripeSessionId: session.id }
            });

            if (order) {
                await order.update({
                    status: 'processing',
                    paymentStatus: 'paid',
                    paymentIntentId: session.payment_intent,
                    shippingAddress: {
                        name: session.shipping_details?.name,
                        address: session.shipping_details?.address
                    }
                });

                // Clear user's cart after successful payment
                await CartItem.destroy({
                    where: { userId: order.userId }
                });
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({
            message: "Error processing webhook",
            error: error.message
        });
    }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.findAll({
            where: { userId },
            include: [{
                model: OrderItem,
                include: [{
                    model: Product,
                    attributes: ['name', 'image']
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            message: "Orders retrieved successfully",
            orders
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            message: "Error retrieving orders",
            error: error.message
        });
    }
};

// Get single order details
exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({
            where: { 
                id: orderId,
                userId // Ensure user can only access their own orders
            },
            include: [{
                model: OrderItem,
                include: [{
                    model: Product,
                    attributes: ['name', 'image']
                }]
            }]
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order retrieved successfully",
            order
        });
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({
            message: "Error retrieving order details",
            error: error.message
        });
    }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{
                model: OrderItem,
                include: [{
                    model: Product,
                    attributes: ['name', 'image']
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            message: "All orders retrieved successfully",
            orders
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            message: "Error retrieving all orders",
            error: error.message
        });
    }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!['processing', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        await order.update({ status });

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            message: "Error updating order status",
            error: error.message
        });
    }
}; 