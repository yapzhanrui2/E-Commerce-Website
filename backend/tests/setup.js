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
        console.log('Connected to test database:', process.env.TEST_DB_NAME);
        
        // Sync models without force: true to preserve data
        await sequelize.sync();
        console.log('Test database models synchronized');
    } catch (error) {
        console.error('Test database setup error:', error);
        throw error;
    }
});

// Global test cleanup
afterAll(async () => {
    try {
        // Only close the connection, don't drop tables
        await sequelize.close();
    } catch (error) {
        console.error('Error closing test database connection:', error);
    }
});

// Clear all mocks after each test
afterEach(() => {
    jest.clearAllMocks();
}); 