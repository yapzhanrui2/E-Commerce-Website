const request = require('supertest');
const { app } = require('../index');
const { Order, OrderItem, Product, User, CartItem } = require('../models');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Mock Stripe
jest.mock('stripe', () => {
    return jest.fn(() => ({
        checkout: {
            sessions: {
                create: jest.fn().mockResolvedValue({
                    id: 'test_session_id',
                    url: 'https://test.stripe.com/checkout',
                    payment_intent: 'test_payment_intent'
                })
            }
        },
        webhooks: {
            constructEvent: jest.fn().mockReturnValue({
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'test_session_id',
                        payment_intent: 'test_payment_intent',
                        shipping_details: {
                            name: 'Test User',
                            address: {
                                line1: '123 Test St',
                                city: 'Test City'
                            }
                        }
                    }
                }
            })
        }
    }));
});

// Test data
const testProduct = {
    name: "Test Product",
    description: "Test Description",
    price: 99.99,
    image: "https://example.com/test.jpg",
    categories: ["test"]
};

const testCartItem = {
    quantity: 2
};

// Test users
const testUser = {
    username: 'testuser',
    email: 'user@test.com',
    password: 'password123',
    role: 'user'
};

const testAdmin = {
    username: 'testadmin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
};

describe('Order Controller Tests', () => {
    let userId;
    let adminId;
    let userToken;
    let adminToken;
    let productId;
    let orderId;

    // Setup test data before all tests
    beforeAll(async () => {
        try {
            // Create test users
            const user = await User.create(testUser);
            const admin = await User.create(testAdmin);
            userId = user.id;
            adminId = admin.id;

            // Generate tokens
            userToken = jwt.sign({ id: userId, email: user.email, role: 'user' }, process.env.JWT_SECRET);
            adminToken = jwt.sign({ id: adminId, email: admin.email, role: 'admin' }, process.env.JWT_SECRET);

            // Create test product
            const product = await Product.create(testProduct);
            productId = product.id;
        } catch (error) {
            console.error('Test setup error:', error);
            throw error;
        }
    });

    // Clean up test data after all tests
    afterAll(async () => {
        try {
            // Delete test data in reverse order of dependencies
            await OrderItem.destroy({ where: { productId } });
            await Order.destroy({ where: { userId: [userId, adminId] } });
            await CartItem.destroy({ where: { userId: [userId, adminId] } });
            await Product.destroy({ where: { id: productId } });
            await User.destroy({ where: { id: [userId, adminId] } });
        } catch (error) {
            console.error('Test cleanup error:', error);
        }
    });

    // Clear data between tests
    beforeEach(async () => {
        await Order.destroy({ where: { userId: [userId, adminId] } });
        await OrderItem.destroy({ where: { productId } });
        await CartItem.destroy({ where: { userId: [userId, adminId] } });
    });

    describe('POST /api/orders/checkout', () => {
        beforeEach(async () => {
            // Create test product if it doesn't exist
            let product = await Product.findByPk(productId);
            if (!product) {
                product = await Product.create(testProduct);
                productId = product.id;
            }

            // Add item to user's cart
            await CartItem.create({
                userId,
                productId,
                quantity: testCartItem.quantity
            });
        });

        test('should create checkout session and order', async () => {
            // Verify cart item exists with product
            const cartItem = await CartItem.findOne({
                where: { userId },
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'price', 'image']
                }]
            });
            expect(cartItem).toBeTruthy();
            expect(cartItem.Product).toBeTruthy();
            // console.log('Cart item before checkout:', JSON.stringify(cartItem.toJSON(), null, 2));

            const res = await request(app)
                .post('/api/orders/checkout')
                .set('Authorization', `Bearer ${userToken}`);

            // console.log('Checkout response:', res.body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('sessionId');
            expect(res.body).toHaveProperty('sessionUrl');

            // Verify order was created
            const order = await Order.findOne({
                where: { userId, stripeSessionId: res.body.sessionId },
                include: [{
                    model: OrderItem,
                    include: [{
                        model: Product,
                        attributes: ['name', 'price']
                    }]
                }]
            });
            // console.log('Created order:', JSON.stringify(order.toJSON(), null, 2));
            expect(order).toBeTruthy();
            expect(order.status).toBe('pending');
            expect(order.paymentStatus).toBe('pending');
            expect(order.OrderItems).toHaveLength(1);
            expect(order.OrderItems[0].productId).toBe(productId);
        });

        test('should fail if cart is empty', async () => {
            await CartItem.destroy({ where: { userId } });

            const res = await request(app)
                .post('/api/orders/checkout')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Cart is empty');
        });

        test('should require authentication', async () => {
            const res = await request(app)
                .post('/api/orders/checkout');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/orders/webhook', () => {
        beforeEach(async () => {
            // Create a pending order
            const order = await Order.create({
                userId,
                totalAmount: testProduct.price * testCartItem.quantity,
                stripeSessionId: 'test_session_id',
                shippingAddress: {},
                status: 'pending',
                paymentStatus: 'pending'
            });
            orderId = order.id;
        });

        test('should process successful checkout session', async () => {
            const res = await request(app)
                .post('/api/orders/webhook')
                .set('stripe-signature', 'test_signature')
                .send({
                    type: 'checkout.session.completed',
                    data: {
                        object: {
                            id: 'test_session_id'
                        }
                    }
                });

            expect(res.status).toBe(200);

            // Verify order was updated
            const order = await Order.findByPk(orderId);
            expect(order.status).toBe('processing');
            expect(order.paymentStatus).toBe('paid');
        });
    });

    describe('GET /api/orders/my-orders', () => {
        beforeEach(async () => {
            // Create test order for user
            const order = await Order.create({
                userId,
                totalAmount: testProduct.price,
                status: 'completed',
                paymentStatus: 'paid',
                shippingAddress: { address: 'Test Address' }
            });

            await OrderItem.create({
                orderId: order.id,
                productId,
                quantity: 1,
                priceAtTime: testProduct.price
            });
        });

        test('should get user orders', async () => {
            const res = await request(app)
                .get('/api/orders/my-orders')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.orders).toHaveLength(1);
            expect(res.body.orders[0].OrderItems).toHaveLength(1);
        });

        test('should require authentication', async () => {
            const res = await request(app)
                .get('/api/orders/my-orders');

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/orders/my-orders/:orderId', () => {
        beforeEach(async () => {
            // Create test order
            const order = await Order.create({
                userId,
                totalAmount: testProduct.price,
                status: 'completed',
                paymentStatus: 'paid',
                shippingAddress: { address: 'Test Address' }
            });
            orderId = order.id;

            await OrderItem.create({
                orderId,
                productId,
                quantity: 1,
                priceAtTime: testProduct.price
            });
        });

        test('should get order details', async () => {
            const res = await request(app)
                .get(`/api/orders/my-orders/${orderId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.order.id).toBe(orderId);
            expect(res.body.order.OrderItems).toHaveLength(1);
        });

        test('should not allow access to other user\'s order', async () => {
            // Create another user's order
            const otherOrder = await Order.create({
                userId: adminId,
                totalAmount: testProduct.price,
                status: 'completed',
                paymentStatus: 'paid',
                shippingAddress: { address: 'Other Address' }
            });

            const res = await request(app)
                .get(`/api/orders/my-orders/${otherOrder.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/orders/all', () => {
        beforeEach(async () => {
            // Create orders for both users
            await Order.create({
                userId,
                totalAmount: testProduct.price,
                status: 'completed',
                paymentStatus: 'paid',
                shippingAddress: { address: 'User Address' }
            });

            await Order.create({
                userId: adminId,
                totalAmount: testProduct.price,
                status: 'completed',
                paymentStatus: 'paid',
                shippingAddress: { address: 'Admin Address' }
            });
        });

        test('should get all orders as admin', async () => {
            const res = await request(app)
                .get('/api/orders/all')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.orders).toHaveLength(2);
        });

        test('should deny access to non-admin users', async () => {
            const res = await request(app)
                .get('/api/orders/all')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });
    });

    describe('PUT /api/orders/:orderId/status', () => {
        beforeEach(async () => {
            // Create test order
            const order = await Order.create({
                userId,
                totalAmount: testProduct.price,
                status: 'processing',
                paymentStatus: 'paid',
                shippingAddress: { address: 'Test Address' }
            });
            orderId = order.id;
        });

        test('should update order status as admin', async () => {
            const res = await request(app)
                .put(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'completed' });

            expect(res.status).toBe(200);
            expect(res.body.order.status).toBe('completed');
        });

        test('should validate status value', async () => {
            const res = await request(app)
                .put(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'invalid_status' });

            expect(res.status).toBe(400);
        });

        test('should deny access to non-admin users', async () => {
            const res = await request(app)
                .put(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ status: 'completed' });

            expect(res.status).toBe(403);
        });
    });
}); 