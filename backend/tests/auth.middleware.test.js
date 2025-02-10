const jwt = require('jsonwebtoken');
const { verifyToken, authorize, isAdmin } = require('../middlewares/auth.middleware');
const User = require('../models/user.model');

// Mock User model
jest.mock('../models/user.model');

describe('Auth Middleware', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;
    let responseObject;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        
        responseObject = {};
        mockRequest = {
            headers: {},
            user: null
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation((result) => {
                responseObject = result;
            })
        };
        nextFunction = jest.fn();
    });

    afterEach(() => {
        // Clean up mocks
        jest.clearAllMocks();
    });

    describe('verifyToken', () => {
        it('should pass with valid token', async () => {
            const validToken = jwt.sign(
                { id: '123', email: 'test@example.com' },
                process.env.JWT_SECRET
            );

            mockRequest.headers.authorization = `Bearer ${validToken}`;

            // Mock user found in database
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                role: 'user'
            };
            User.findByPk.mockResolvedValue(mockUser);

            await verifyToken(mockRequest, mockResponse, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user).toBeDefined();
            expect(mockRequest.user.id).toBe('123');
        });

        it('should fail with no token', async () => {
            await verifyToken(mockRequest, mockResponse, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseObject.message).toBe('No token provided');
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should fail with invalid token format', async () => {
            mockRequest.headers.authorization = 'InvalidFormat token';

            await verifyToken(mockRequest, mockResponse, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseObject.message).toBe('No token provided');
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should fail with invalid token', async () => {
            mockRequest.headers.authorization = 'Bearer invalid.token.here';

            await verifyToken(mockRequest, mockResponse, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseObject.message).toBe('Invalid token');
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('authorize middleware', () => {
        it('should allow access for correct role', () => {
            mockRequest.user = { role: 'admin' };
            const authorizeAdmin = authorize('admin');

            authorizeAdmin(mockRequest, mockResponse, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
        });

        it('should deny access for incorrect role', () => {
            mockRequest.user = { role: 'user' };
            const authorizeAdmin = authorize('admin');

            authorizeAdmin(mockRequest, mockResponse, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(responseObject.message).toBe("You don't have permission to perform this action");
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should handle multiple roles correctly', () => {
            mockRequest.user = { role: 'user' };
            const authorizeMultiple = authorize('admin', 'user');

            authorizeMultiple(mockRequest, mockResponse, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
        });
    });

    describe('isAdmin middleware', () => {
        it('should allow access for admin role', () => {
            mockRequest.user = { role: 'admin' };

            isAdmin(mockRequest, mockResponse, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
        });

        it('should deny access for non-admin role', () => {
            mockRequest.user = { role: 'user' };

            isAdmin(mockRequest, mockResponse, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });
}); 