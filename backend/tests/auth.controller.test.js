const { register, login } = require('../controllers/auth.controller');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Mock User model
jest.mock('../models/user.model');

describe('Auth Controller', () => {
    let mockRequest;
    let mockResponse;
    let responseObject;

    beforeEach(() => {
        responseObject = {};
        mockRequest = {
            body: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation((result) => {
                responseObject = result;
            })
        };
    });

    describe('register', () => {
        const validUserData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };

        it('should successfully register a new user', async () => {
            // Mock User.findOne to return null (no existing user)
            User.findOne.mockResolvedValue(null);

            // Mock User.create to return a new user
            const createdUser = {
                id: '123',
                ...validUserData,
                role: 'user',
                password: 'hashedpassword'
            };
            User.create.mockResolvedValue(createdUser);

            mockRequest.body = validUserData;

            await register(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toHaveProperty('token');
            expect(responseObject.user).toHaveProperty('id');
            expect(responseObject.user).not.toHaveProperty('password');
        });

        it('should return 400 if user already exists', async () => {
            // Mock User.findOne to return an existing user
            User.findOne.mockResolvedValue({ id: '123', email: validUserData.email });

            mockRequest.body = validUserData;

            await register(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.message).toBe('User with this email already exists');
        });
    });

    describe('login', () => {
        const validCredentials = {
            email: 'test@example.com',
            password: 'password123'
        };

        it('should successfully login a user with valid credentials', async () => {
            // Mock found user with valid password
            const foundUser = {
                id: '123',
                email: validCredentials.email,
                username: 'testuser',
                role: 'user',
                isValidPassword: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(foundUser);

            mockRequest.body = validCredentials;

            await login(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toHaveProperty('token');
            expect(responseObject.user).toHaveProperty('id');
            expect(responseObject.message).toBe('Login successful');
        });

        it('should return 401 for invalid credentials', async () => {
            // Mock user not found
            User.findOne.mockResolvedValue(null);

            mockRequest.body = validCredentials;

            await login(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseObject.message).toBe('Invalid email or password');
        });

        it('should return 401 for incorrect password', async () => {
            // Mock found user with invalid password
            const foundUser = {
                id: '123',
                email: validCredentials.email,
                isValidPassword: jest.fn().mockResolvedValue(false)
            };
            User.findOne.mockResolvedValue(foundUser);

            mockRequest.body = validCredentials;

            await login(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseObject.message).toBe('Invalid email or password');
        });
    });
}); 