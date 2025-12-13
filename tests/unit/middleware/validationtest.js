const validation = require('../../../middleware/validation');

describe('Validation Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {}
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('validateCreateList', () => {
    describe('Happy Path', () => {
      it('should pass validation for valid list creation data', () => {
        mockReq.body = {
          name: 'My Shopping List'
        };
        
        validation.validateCreateList(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith();
        expect(mockNext.mock.calls[0][0]).toBeUndefined();
      });
    });

    describe('Alternative Scenarios', () => {
      it('should return 400 for missing name field', () => {
        mockReq.body = {};
        
        validation.validateCreateList(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 400,
          message: expect.stringContaining('Validation failed')
        }));
      });

      it('should return 400 for empty name', () => {
        mockReq.body = {
          name: ''
        };
        
        validation.validateCreateList(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 400
        }));
      });

      it('should return 400 for name too long', () => {
        mockReq.body = {
          name: 'a'.repeat(101) // More than 100 characters
        };
        
        validation.validateCreateList(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 400
        }));
      });
    });
  });

  describe('validateIdQuery', () => {
    describe('Happy Path', () => {
      it('should pass validation for valid id query', () => {
        mockReq.query = {
          id: '507f1f77bcf86cd799439011'
        };
        
        validation.validateIdQuery(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    describe('Alternative Scenarios', () => {
      it('should return 400 for missing id', () => {
        mockReq.query = {};
        
        validation.validateIdQuery(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 400,
          message: expect.stringContaining('Validation failed')
        }));
      });

      it('should return 400 for empty id', () => {
        mockReq.query = {
          id: ''
        };
        
        validation.validateIdQuery(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 400
        }));
      });
    });
  });

  describe('validateAssignRole', () => {
    describe('Happy Path', () => {
      it('should pass validation for valid assign role data (Authority)', () => {
        mockReq.body = {
          userId: '507f1f77bcf86cd799439011',
          role: 'Authority'
        };
        
        validation.validateAssignRole(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should pass validation for valid assign role data (User)', () => {
        mockReq.body = {
          userId: '507f1f77bcf86cd799439011',
          role: 'User'
        };
        
        validation.validateAssignRole(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    describe('Alternative Scenarios', () => {
      it('should return 400 for missing userId', () => {
        mockReq.body = {
          role: 'Authority'
        };
        
        validation.validateAssignRole(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 400,
          message: expect.stringContaining('Validation failed')
        }));
      });

      it('should return 400 for missing role', () => {
        mockReq.body = {
          userId: '507f1f77bcf86cd799439011'
        };
        
        validation.validateAssignRole(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 400
        }));
      });

      it('should return 400 for invalid role', () => {
        mockReq.body = {
          userId: '507f1f77bcf86cd799439011',
          role: 'InvalidRole'
        };
        
        validation.validateAssignRole(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 400
        }));
      });

      it('should return 400 for empty userId', () => {
        mockReq.body = {
          userId: '',
          role: 'Authority'
        };
        
        validation.validateAssignRole(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 400
        }));
      });
    });
  });

  // Test that middleware functions are properly exported
  describe('Middleware Export', () => {
    it('should export validateCreateList function', () => {
      expect(typeof validation.validateCreateList).toBe('function');
    });

    it('should export validateIdQuery function', () => {
      expect(typeof validation.validateIdQuery).toBe('function');
    });

    it('should export validateAssignRole function', () => {
      expect(typeof validation.validateAssignRole).toBe('function');
    });
  });
});