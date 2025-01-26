const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const models = require('../models');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Global test setup
beforeAll(async () => {
    try {
        await sequelize.authenticate();
        
        // Force sync all models and their associations
        await sequelize.sync({ force: true });
        
        // Verify models are properly set up
        console.log('Available models:', Object.keys(sequelize.models));
        
    } catch (error) {
        console.error('Test database setup error:', error);
        throw error;
    }
});

// Global test cleanup
afterAll(async () => {
    try {
        await sequelize.close();
    } catch (error) {
        console.error('Error closing test database connection:', error);
    }
});

// Clear all mocks after each test
afterEach(() => {
    jest.clearAllMocks();
}); 