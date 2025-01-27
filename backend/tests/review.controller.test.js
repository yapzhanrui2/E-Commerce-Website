const request = require('supertest');
const { app } = require('../index');
const { Review, Product, User } = require('../models');
const jwt = require('jsonwebtoken');

// Mock data
const testProduct = {
    name: "Test Product",
    description: "Test Description",
    price: 99.99,
    image: "https://example.com/test.jpg",
    categories: ["test"]
};

const testReview = {
    rating: 4,
    comment: "Great product!"
};

const invalidReview = {
    rating: 6, // Invalid rating
    comment: "Invalid rating"
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

describe('Review Controller Tests', () => {
    let productId;
    let user1Id;
    let user2Id;
    let user1Token;
    let user2Token;

    // Setup test data before all tests
    beforeAll(async () => {
        try {
            // Clear existing users and create test users
            await User.destroy({ where: {}, force: true });
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
            await Review.destroy({ where: {}, force: true });
        } catch (error) {
            console.error('Test cleanup error:', error);
        }
    });

    // Clear reviews before each test
    beforeEach(async () => {
        try {
            await Review.destroy({
                where: {},
                force: true,
                truncate: { cascade: true }
            });
        } catch (error) {
            console.error('Error clearing reviews:', error);
        }
    });

    describe('POST /api/reviews', () => {
        test('should create review when authenticated', async () => {
            const res = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ ...testReview, productId });
            
            expect(res.status).toBe(201);
            expect(res.body.review.rating).toBe(testReview.rating);
            expect(res.body.review.comment).toBe(testReview.comment);
            expect(res.body.review.userId).toBe(user1Id);
            expect(res.body.review.productId).toBe(productId);
        });

        test('should reject review creation without authentication', async () => {
            const res = await request(app)
                .post('/api/reviews')
                .send({ ...testReview, productId });
            
            expect(res.status).toBe(401);
        });

        test('should reject invalid rating', async () => {
            const res = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ ...invalidReview, productId });
            
            expect(res.status).toBe(400);
        });

        test('should reject duplicate review from same user', async () => {
            // Create first review
            await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ ...testReview, productId });

            // Attempt to create second review
            const res = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ ...testReview, productId });
            
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("You have already reviewed this product");
        });

        test('should reject review for non-existent product', async () => {
            const nonExistentProductId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ ...testReview, productId: nonExistentProductId });
            
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/reviews/:productId', () => {
        beforeEach(async () => {
            // Create test reviews
            await Review.create({
                ...testReview,
                productId,
                userId: user1Id
            });
            await Review.create({
                rating: 5,
                comment: "Excellent!",
                productId,
                userId: user2Id
            });
        });

        test('should get all reviews for a product', async () => {
            const res = await request(app)
                .get(`/api/reviews/${productId}`);
            
            expect(res.status).toBe(200);
            expect(res.body.reviews).toHaveLength(2);
            expect(res.body.averageRating).toBe(4.5);
            expect(res.body.totalReviews).toBe(2);
            expect(res.body.reviews[0].User).toBeDefined();
            expect(res.body.reviews[0].User.username).toBeDefined();
        });

        test('should return 404 for non-existent product', async () => {
            const nonExistentProductId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .get(`/api/reviews/${nonExistentProductId}`);
            
            expect(res.status).toBe(404);
        });

        test('should return empty reviews array for product with no reviews', async () => {
            // Clear all reviews first
            await Review.destroy({ where: {}, force: true });
            
            const res = await request(app)
                .get(`/api/reviews/${productId}`);
            
            expect(res.status).toBe(200);
            expect(res.body.reviews).toHaveLength(0);
            expect(res.body.averageRating).toBe(0);
            expect(res.body.totalReviews).toBe(0);
        });
    });
}); 