const roleAuth = require('../../../middleware/role-auth');
const { ShoppingList } = require('../../../models/ShoppingList');

// Mock models
jest.mock('../../../models/ShoppingList');

describe('Role Auth Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      user: {
        _id: 'user123',
        profiles: ['Member']
      },
      params: {},
      body: {},
      query: {}
    };
    mockRes = {};
    mockNext = jest.fn();
    ShoppingList.findById.mockClear();
  });

  describe('requireAuthority', () => {
    it('should allow access for Authority user', () => {
      mockReq.user.profiles = ['Authority', 'Member'];
      
      roleAuth.requireAuthority(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should deny access for non-Authority user', () => {
      mockReq.user.profiles = ['Member']; // No Authority role
      
      roleAuth.requireAuthority(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        status: 403,
        message: 'Authority access required'
      }));
    });
  });

  describe('requireOwnerOrMember', () => {
    describe('Happy Path Scenarios', () => {
      it('should allow access for list owner', async () => {
        const mockList = {
            _id: 'list123',
            owner: { equals: jest.fn().mockReturnValue(true), _id: 'user123' },
            members: [],
          };
        
        ShoppingList.findById.mockResolvedValue(mockList);
        mockReq.params.listId = 'list123';
        
        await roleAuth.requireOwnerOrMember(mockReq, mockRes, mockNext);
        
        expect(mockReq.list).toEqual(mockList);
        expect(mockReq.userRole).toBe('Owner');
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should allow access for list member', async () => {
        const mockList = {
          _id: 'list123',
          owner: { equals: jest.fn().mockReturnValue(false), _id: 'otherUser' },
          members: [
            { user: { equals: jest.fn().mockReturnValue(true), _id: 'user123' }, role: 'Member' }
          ]
        };
        
        ShoppingList.findById.mockResolvedValue(mockList);
        mockReq.params.listId = 'list123';
        
        await roleAuth.requireOwnerOrMember(mockReq, mockRes, mockNext);
        
        expect(mockReq.list).toEqual(mockList);
        expect(mockReq.userRole).toBe('Member');
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should allow access for Authority user regardless of ownership', async () => {
        mockReq.user.profiles = ['Authority', 'Member'];
        
        const mockList = {
          _id: 'list123',
          owner: { equals: jest.fn().mockReturnValue(false), _id: 'otherUser' },
          members: []
        };
        
        ShoppingList.findById.mockResolvedValue(mockList);
        mockReq.params.listId = 'list123';
        
        await roleAuth.requireOwnerOrMember(mockReq, mockRes, mockNext);
        
        expect(mockReq.list).toEqual(mockList);
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should pass through when no listId is provided', async () => {
        await roleAuth.requireOwnerOrMember(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith();
        expect(ShoppingList.findById).not.toHaveBeenCalled();
      });
    });

    describe('Alternative Scenarios', () => {
      it('should return 404 when list not found', async () => {
        ShoppingList.findById.mockResolvedValue(null);
        mockReq.params.listId = 'nonexistent';
        
        await roleAuth.requireOwnerOrMember(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 404,
          message: 'List not found'
        }));
      });

      it('should return 403 for unauthorized access', async () => {
        const mockList = {
            _id: 'list123',
            owner: { equals: jest.fn().mockReturnValue(false), _id: 'otherUser' },
            members: [], // User is not a member
          };
        
        ShoppingList.findById.mockResolvedValue(mockList);
        mockReq.params.listId = 'list123';
        
        await roleAuth.requireOwnerOrMember(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 403,
          message: 'Access denied to this list'
        }));
      });

      it('should handle database errors', async () => {
        ShoppingList.findById.mockRejectedValue(new Error('Database error'));
        mockReq.params.listId = 'list123';
        
        await roleAuth.requireOwnerOrMember(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    it('should extract listId from body when not in params', async () => {
      const mockList = {
        _id: 'list123',
        owner: { equals: jest.fn().mockReturnValue(true), _id: 'user123' },
        members: []
      };
      
      ShoppingList.findById.mockResolvedValue(mockList);
      mockReq.body.shoppingListId = 'list123'; // listId in body
      
      await roleAuth.requireOwnerOrMember(mockReq, mockRes, mockNext);
      
      expect(ShoppingList.findById).toHaveBeenCalledWith('list123');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should extract listId from query when not in params or body', async () => {
      const mockList = {
        _id: 'list123',
        owner: { equals: jest.fn().mockReturnValue(true), _id: 'user123' },
        members: []
      };
      
      ShoppingList.findById.mockResolvedValue(mockList);
      mockReq.query.listId = 'list123'; // listId in query
      
      await roleAuth.requireOwnerOrMember(mockReq, mockRes, mockNext);
      
      expect(ShoppingList.findById).toHaveBeenCalledWith('list123');
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireListOwner', () => {
    describe('Happy Path Scenarios', () => {
      it('should allow access for list owner', async () => {
        const mockList = {
          _id: 'list123',
          owner: { equals: jest.fn().mockReturnValue(true), _id: 'user123' }
        };
        
        ShoppingList.findById.mockResolvedValue(mockList);
        mockReq.params.listId = 'list123';
        
        await roleAuth.requireListOwner(mockReq, mockRes, mockNext);
        
        expect(mockReq.list).toEqual(mockList);
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should allow access for Authority user', async () => {
        mockReq.user.profiles = ['Authority', 'Member'];
        
        const mockList = {
          _id: 'list123',
          owner: { equals: jest.fn().mockReturnValue(false), _id: 'otherUser' }
        };
        
        ShoppingList.findById.mockResolvedValue(mockList);
        mockReq.params.listId = 'list123';
        
        await roleAuth.requireListOwner(mockReq, mockRes, mockNext);
        
        expect(mockReq.list).toEqual(mockList);
        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    describe('Alternative Scenarios', () => {
      it('should return 404 when list not found', async () => {
        ShoppingList.findById.mockResolvedValue(null);
        mockReq.params.listId = 'nonexistent';
        
        await roleAuth.requireListOwner(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 404,
          message: 'List not found'
        }));
      });

      it('should return 403 for non-owner', async () => {
        const mockList = {
            _id: 'list123',
            owner: { equals: jest.fn().mockReturnValue(false), _id: 'otherUser' }
          };
        
        ShoppingList.findById.mockResolvedValue(mockList);
        mockReq.params.listId = 'list123';
        
        await roleAuth.requireListOwner(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
          status: 403,
          message: 'Only list owner can perform this action'
        }));
      });
    });
  });
});