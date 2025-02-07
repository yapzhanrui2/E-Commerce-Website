const request = require('supertest');
const { app } = require('../index');
const CartItem = require('../models/cart.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

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
const testUser1 = {
    username: 'testuser1',
    email: 'user1@test.com',
    password: 'password123',
    role: 'user'
};

const testUser2 = {
    username: 'testuser2',
    email: 'user2@test.com',
    password: 'password123',
    role: 'user'
};

describe('Cart Controller Tests', () => {
    let user1Id;
    let user2Id;
    let user1Token;
    let user2Token;
    let productId;
    let cartItemId;

    // Setup test users and product before all tests
    beforeAll(async () => {
        try {
            // Create test users
            const user1 = await User.create(testUser1);
            const user2 = await User.create(testUser2);
            
            user1Id = user1.id;
            user2Id = user2.id;
            
            // Generate tokens
            user1Token = jwt.sign({ id: user1Id, role: 'user' }, process.env.JWT_SECRET);
            user2Token = jwt.sign({ id: user2Id, role: 'user' }, process.env.JWT_SECRET);

            // Create test product
            const product = await Product.create(testProduct);
            productId = product.id;

            // Verify product was created
            const verifyProduct = await Product.findByPk(productId);
            if (!verifyProduct) {
                throw new Error('Failed to create test product');
            }
        } catch (error) {
            console.error('Test setup error:', error);
            throw error;
        }
    });

    // Cleanup after all tests
    afterAll(async () => {
        try {
            // Delete test data in reverse order of dependencies
            await CartItem.destroy({ where: { userId: [user1Id, user2Id] } });
            await Product.destroy({ where: { id: productId } });
            await User.destroy({ where: { id: [user1Id, user2Id] } });
        } catch (error) {
            console.error('Test cleanup error:', error);
        }
    });

    // Clear only test cart items before each test
    beforeEach(async () => {
        try {
            await CartItem.destroy({ where: { userId: [user1Id, user2Id] } });
            cartItemId = null;
        } catch (error) {
            console.error('Error clearing test cart items:', error);
        }
    });

    describe('POST /api/cart/items', () => {
        test('should verify product model structure', async () => {
            // Verify the product exists and has correct structure
            const product = await Product.findByPk(productId);
            console.log('Product from DB:', product ? product.toJSON() : 'Not found');
            expect(product).toBeDefined();
            expect(product.name).toBe(testProduct.name);
            expect(product.price).toBe(testProduct.price);
        });

        test('should add item to cart', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                    productId: productId,
                    quantity: testCartItem.quantity
                });
            
            // Log response for debugging
            if (res.status !== 201) {
                console.error('Response:', res.body);
            }
            
            expect(res.status).toBe(201);
            expect(res.body.cartItem).toBeDefined();
            expect(res.body.cartItem.quantity).toBe(testCartItem.quantity);
            expect(res.body.cartItem.Product).toBeDefined();
            expect(res.body.cartItem.Product.name).toBe(testProduct.name);
            cartItemId = res.body.cartItem.id;

            // Verify cart item was created with proper associations
            const verifyCartItem = await CartItem.findByPk(cartItemId, {
                include: [{ model: Product }]
            });
            expect(verifyCartItem).toBeDefined();
            expect(verifyCartItem.Product).toBeDefined();
            expect(verifyCartItem.Product.name).toBe(testProduct.name);
        });

        test('should increment quantity if item already exists', async () => {
            // First addition
            await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                    productId: productId,
                    quantity: 1
                });

            // Second addition
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                    productId: productId,
                    quantity: 2
                });
            
            expect(res.status).toBe(201);
            expect(res.body.cartItem.quantity).toBe(3); // 1 + 2
        });

        test('should reject addition without token', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .send({
                    productId: productId,
                    quantity: testCartItem.quantity
                });
            
            expect(res.status).toBe(401);
        });

        test('should reject addition with invalid product id', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                    productId: '00000000-0000-0000-0000-000000000000',
                    quantity: testCartItem.quantity
                });
            
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/cart', () => {
        beforeEach(async () => {
            // Add test item to user1's cart
            await CartItem.create({
                userId: user1Id,
                productId: productId,
                quantity: testCartItem.quantity
            });
        });

        test('should get user cart items', async () => {
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${user1Token}`);
            
            expect(res.status).toBe(200);
            expect(res.body.cartItems).toHaveLength(1);
            expect(res.body.cartItems[0].quantity).toBe(testCartItem.quantity);
            expect(res.body.cartItems[0].Product.name).toBe(testProduct.name);
        });

        test('should return empty cart for user with no items', async () => {
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${user2Token}`);
            
            expect(res.status).toBe(200);
            expect(res.body.cartItems).toHaveLength(0);
        });

        test('should reject request without token', async () => {
            const res = await request(app)
                .get('/api/cart');
            
            expect(res.status).toBe(401);
        });
    });

    describe('PUT /api/cart/items/:itemId', () => {
        beforeEach(async () => {
            // Add test item to user1's cart
            const cartItem = await CartItem.create({
                userId: user1Id,
                productId: productId,
                quantity: testCartItem.quantity
            });
            cartItemId = cartItem.id;
        });

        test('should update cart item quantity', async () => {
            const newQuantity = 5;
            const res = await request(app)
                .put(`/api/cart/items/${cartItemId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ quantity: newQuantity });
            
            expect(res.status).toBe(200);
            expect(res.body.cartItem.quantity).toBe(newQuantity);
        });

        test('should reject update with invalid quantity', async () => {
            const res = await request(app)
                .put(`/api/cart/items/${cartItemId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ quantity: 0 });
            
            expect(res.status).toBe(400);
        });

        test('should reject update of other user\'s cart item', async () => {
            const res = await request(app)
                .put(`/api/cart/items/${cartItemId}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send({ quantity: 5 });
            
            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /api/cart/items/:itemId', () => {
        beforeEach(async () => {
            // Add test item to user1's cart
            const cartItem = await CartItem.create({
                userId: user1Id,
                productId: productId,
                quantity: testCartItem.quantity
            });
            cartItemId = cartItem.id;
        });

        test('should remove item from cart', async () => {
            const res = await request(app)
                .delete(`/api/cart/items/${cartItemId}`)
                .set('Authorization', `Bearer ${user1Token}`);
            
            expect(res.status).toBe(200);
            
            // Verify item is deleted
            const deletedItem = await CartItem.findByPk(cartItemId);
            expect(deletedItem).toBeNull();
        });

        test('should reject deletion of other user\'s cart item', async () => {
            const res = await request(app)
                .delete(`/api/cart/items/${cartItemId}`)
                .set('Authorization', `Bearer ${user2Token}`);
            
            expect(res.status).toBe(404);
        });

        test('should reject deletion without token', async () => {
            const res = await request(app)
                .delete(`/api/cart/items/${cartItemId}`);
            
            expect(res.status).toBe(401);
        });
    });
}); 