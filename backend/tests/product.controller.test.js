const request = require('supertest');
const { app } = require('../index');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Mock data
const testProduct = {
    name: "Test Product",
    description: "Test Description",
    price: 99.99,
    image: "https://example.com/test.jpg",
    categories: ["test", "sample"]
};

const updatedProduct = {
    name: "Updated Product",
    description: "Updated Description",
    price: 149.99,
    image: "https://example.com/updated.jpg",
    categories: ["updated", "sample"]
};

// Test users
const testAdmin = {
    username: 'testadmin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
};

const testUser = {
    username: 'testuser',
    email: 'user@test.com',
    password: 'password123',
    role: 'user'
};

describe('Product Controller Tests', () => {
    let productId;
    let adminId;
    let userId;
    let adminToken;
    let userToken;

    // Setup test users before all tests
    beforeAll(async () => {
        try {
            // Clear existing users
            await User.destroy({ where: {}, force: true });
            
            // Create test users and store their IDs
            const admin = await User.create(testAdmin);
            const user = await User.create(testUser);
            
            adminId = admin.id;
            userId = user.id;
            
            // Generate tokens with the actual user IDs
            adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET);
            userToken = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET);
        } catch (error) {
            console.error('Test setup error:', error);
            throw error;
        }
    });

    // Cleanup after all tests
    afterAll(async () => {
        try {
            await User.destroy({ where: {}, force: true });
            await Product.destroy({ where: {}, force: true });
        } catch (error) {
            console.error('Test cleanup error:', error);
        }
    });

    // Clear products before each test
    beforeEach(async () => {
        try {
            await Product.destroy({
                where: {},
                force: true,
                truncate: { cascade: true }
            });
        } catch (error) {
            console.error('Error clearing products:', error);
        }
    });

    describe('GET /api/products', () => {
        beforeEach(async () => {
            await Product.create(testProduct);
        });

        test('should get all products', async () => {
            const res = await request(app)
                .get('/api/products');
            
            expect(res.status).toBe(200);
            expect(res.body.products).toHaveLength(1);
            expect(res.body.products[0].name).toBe(testProduct.name);
        });

        test('should filter products by category', async () => {
            const res = await request(app)
                .get('/api/products')
                .query({ category: 'test' });
            
            expect(res.status).toBe(200);
            expect(res.body.products).toHaveLength(1);
        });

        test('should filter products by search term', async () => {
            const res = await request(app)
                .get('/api/products')
                .query({ search: 'Test' });
            
            expect(res.status).toBe(200);
            expect(res.body.products).toHaveLength(1);
        });
    });

    describe('GET /api/products/:id', () => {
        beforeEach(async () => {
            const product = await Product.create(testProduct);
            productId = product.id;
        });

        test('should get product by id', async () => {
            const res = await request(app)
                .get(`/api/products/${productId}`);
            
            expect(res.status).toBe(200);
            expect(res.body.product.name).toBe(testProduct.name);
        });

        test('should return 404 for non-existent product', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .get(`/api/products/${nonExistentId}`);
            
            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/products', () => {
        test('should create product when admin', async () => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(testProduct);
            
            expect(res.status).toBe(201);
            expect(res.body.product.name).toBe(testProduct.name);
            expect(Array.isArray(res.body.product.categories)).toBe(true);
        });

        test('should reject creation when not admin', async () => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${userToken}`)
                .send(testProduct);
            
            expect(res.status).toBe(403);
        });

        test('should reject creation without token', async () => {
            const res = await request(app)
                .post('/api/products')
                .send(testProduct);
            
            expect(res.status).toBe(401);
        });

        test('should validate required fields', async () => {
            const invalidProduct = {
                description: "Missing required fields"
            };

            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidProduct);
            
            expect(res.status).toBe(400);
        });
    });

    describe('PUT /api/products/:id', () => {
        beforeEach(async () => {
            const product = await Product.create(testProduct);
            productId = product.id;
        });

        test('should update product when admin', async () => {
            const res = await request(app)
                .put(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updatedProduct);
            
            expect(res.status).toBe(200);
            expect(res.body.product.name).toBe(updatedProduct.name);
            expect(Array.isArray(res.body.product.categories)).toBe(true);
        });

        test('should reject update when not admin', async () => {
            const res = await request(app)
                .put(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updatedProduct);
            
            expect(res.status).toBe(403);
        });

        test('should reject update without token', async () => {
            const res = await request(app)
                .put(`/api/products/${productId}`)
                .send(updatedProduct);
            
            expect(res.status).toBe(401);
        });
    });

    describe('DELETE /api/products/:id', () => {
        beforeEach(async () => {
            const product = await Product.create(testProduct);
            productId = product.id;
        });

        test('should delete product when admin', async () => {
            const res = await request(app)
                .delete(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res.status).toBe(200);
            
            // Verify product is deleted
            const deletedProduct = await Product.findByPk(productId);
            expect(deletedProduct).toBeNull();
        });

        test('should reject deletion when not admin', async () => {
            const res = await request(app)
                .delete(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(res.status).toBe(403);
        });

        test('should reject deletion without token', async () => {
            const res = await request(app)
                .delete(`/api/products/${productId}`);
            
            expect(res.status).toBe(401);
        });
    });
}); 
