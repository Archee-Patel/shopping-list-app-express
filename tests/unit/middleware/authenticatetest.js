
const jwt = require('jsonwebtoken');
const authenticate = require('../../../middleware/authenticate');
const User = require('../../../models/User');

// Mock User model
jest.mock('../../../models/User');

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {};
    mockNext = jest.fn();
    User.findById.mockClear();
  });

  describe('Happy Path', () => {
    it('should authenticate user with valid token', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        profiles: ['Member']
      };
      
      User.findById.mockResolvedValue(mockUser);
      
      const token = jwt.sign(
        { userId: 'user123', email: 'test@example.com', profiles: ['Member'] },
        process.env.JWT_SECRET,
        { expiresIn: '1h', issuer: 'shopping-list-app' }
      );
      
      mockReq.headers.authorization = `Bearer ${token}`;
      
      await authenticate(mockReq, mockRes, mockNext);
      
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('Alternative Scenarios', () => {
    it('should return 401 when no authorization header', async () => {
      await authenticate(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        status: 401,
        message: 'Bearer token required'
      }));
    });

    it('should return 401 when malformed authorization header', async () => {
      mockReq.headers.authorization = 'InvalidTokenFormat';
      
      await authenticate(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        status: 401,
        message: 'Bearer token required'
      }));
    });

    it('should return 401 when token is invalid', async () => {
      mockReq.headers.authorization = 'Bearer invalid.token.here';
      
      await authenticate(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        status: 401
      }));
    });

    it('should return 401 when user not found', async () => {
      User.findById.mockResolvedValue(null);
      
      const token = jwt.sign(
        { userId: 'non-existent-user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h', issuer: 'shopping-list-app' }
      );
      
      mockReq.headers.authorization = `Bearer ${token}`;
      
      await authenticate(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        status: 401,
        message: 'User not found'
      }));
    });
  });
});