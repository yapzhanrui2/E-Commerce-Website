const jwt = require('jsonwebtoken');


// Mock the database connection
jest.mock('../config/database', () => {
    const { Sequelize } = require('sequelize');
    const mockSequelize = new Sequelize('sqlite::memory:', { logging: false });
    return mockSequelize;
});

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';

// Clear all mocks after each test
afterEach(() => {
    jest.clearAllMocks();
}); 