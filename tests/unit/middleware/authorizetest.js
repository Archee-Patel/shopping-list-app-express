
const authorize = require('../../../middleware/authorize');

describe('Authorization Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      user: null
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('Role-Based Access Control', () => {
    it('should allow access when user has required profile', () => {
      mockReq.user = {
        profiles: ['Authority', 'Member']
      };
      
      const middleware = authorize(['Authority']);
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access when user has any of multiple required profiles', () => {
      mockReq.user = {
        profiles: ['Member']
      };
      
      const middleware = authorize(['Authority', 'Member']);
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should deny access when user lacks required profiles', () => {
      mockReq.user = {
        profiles: ['Member']
      };
      
      const middleware = authorize(['Authority']);
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        status: 403,
        message: expect.stringContaining('Access denied')
      }));
    });

    it('should deny access when user has no profiles', () => {
      mockReq.user = {
        profiles: []
      };
      
      const middleware = authorize(['Member']);
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        status: 403
      }));
    });

    it('should return 401 when user is not authenticated', () => {
      mockReq.user = null;
      
      const middleware = authorize(['Member']);
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        status: 401,
        message: 'Unauthorized'
      }));
    });

    it('should allow all when allowedProfiles is empty', () => {
      mockReq.user = {
        profiles: ['Member']
      };
      
      const middleware = authorize([]);
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});