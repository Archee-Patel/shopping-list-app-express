
const { list, create, get, remove, addItem, removeItem, shareList, update } = require('../../../abl/shopping-listabl');
const { ShoppingList, Item } = require('../../../models/ShoppingList');

// Mock models
jest.mock('../../../models/ShoppingList');

describe('Shopping List ABL', () => {
  let mockUser;
  
  beforeEach(() => {
    mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      profiles: ['Member']
    };
    
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a shopping list', async () => {
      const mockList = {
          _id: 'list123',
          name: 'My List',
          owner: { equals: jest.fn().mockReturnValue(true), _id: 'user123' },
          members: [{ user: { equals: jest.fn().mockReturnValue(true), _id: 'user123' }, role: 'Owner' }],
          save: jest.fn()
        };
      
      ShoppingList.create.mockResolvedValue(mockList);
      ShoppingList.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockList)
      });
      
      const result = await create({
        name: 'My List',
        user: mockUser
      });
      
      expect(result).toEqual(mockList);
      expect(ShoppingList.create).toHaveBeenCalledWith({
        name: 'My List',
        owner: 'user123',
        members: [{ user: 'user123', role: 'Owner' }]
      });
    });
  });

  describe('list', () => {
    it('should return lists with pagination', async () => {
      const mockLists = [
        { _id: 'list1', name: 'List 1', owner: { equals: jest.fn().mockReturnValue(true), _id: 'user123' } },
        { _id: 'list2', name: 'List 2', owner: { equals: jest.fn().mockReturnValue(true), _id: 'user123' } }
      ];
      
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        // A thenable - so awaiting this mocked query resolves to mockLists
        then: function (onFulfilled) { return Promise.resolve(mockLists).then(onFulfilled); }
      };
      
      ShoppingList.find.mockReturnValue(mockQuery);
      ShoppingList.countDocuments.mockResolvedValue(2);
      
      const result = await list({
        page: 0,
        pageSize: 10,
        user: mockUser
      });
      
      expect(result.lists).toEqual(mockLists);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('addItem', () => {
    describe('Happy Path', () => {
      it('should add item to list when user is owner', async () => {
        const mockList = {
          _id: 'list123',
          owner: { equals: jest.fn().mockReturnValue(true), _id: 'user123' },
          members: [{ user: { equals: jest.fn().mockReturnValue(true), _id: 'user123' } }],
          save: jest.fn()
        };
        
        const mockItem = {
          _id: 'item123',
          name: 'Milk',
          quantity: 2,
          shoppingList: 'list123',
          createdBy: 'user123'
        };
        
        ShoppingList.findById.mockResolvedValue(mockList);
        Item.create.mockResolvedValue(mockItem);
        Item.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockItem)
        });
        
        const result = await addItem({
          shoppingListId: 'list123',
          name: 'Milk',
          quantity: 2,
          user: mockUser
        });
        
        expect(result).toEqual(mockItem);
      });
    });

    describe('Alternative Scenarios', () => {
      it('should throw error when list not found', async () => {
        ShoppingList.findById.mockResolvedValue(null);
        
        await expect(
          addItem({
            shoppingListId: 'nonexistent',
            name: 'Milk',
            user: mockUser
          })
        ).rejects.toThrow('List not found');
      });

      it('should throw error when user has no access', async () => {
        const mockList = {
            _id: 'list123',
            owner: { equals: jest.fn().mockReturnValue(false), _id: 'otherUser' }, // Different owner
            members: []
          };
        
        ShoppingList.findById.mockResolvedValue(mockList);
        
        await expect(
          addItem({
            shoppingListId: 'list123',
            name: 'Milk',
            user: mockUser
          })
        ).rejects.toThrow('Access denied');
      });
    });
  });

  describe('removeItem', () => {
    it('should remove item when user is creator', async () => {
      const mockItem = {
        _id: 'item123',
        name: 'Milk',
        createdBy: { equals: jest.fn().mockReturnValue(true), _id: 'user123' },
        shoppingList: {
          _id: 'list123',
          owner: { equals: jest.fn().mockReturnValue(true), _id: 'user123' }
        }
      };
      
      Item.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockItem) });
      Item.findByIdAndDelete.mockResolvedValue(true);
      
      const result = await removeItem({
        itemId: 'item123',
        user: mockUser
      });
      
      expect(result).toEqual({ itemId: 'item123', removed: true });
    });

    it('should throw error when item not found', async () => {
      Item.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
      
      await expect(
        removeItem({
          itemId: 'nonexistent',
          user: mockUser
        })
      ).rejects.toThrow('Item not found');
    });
  });

  describe('update', () => {
  it('should update a shopping list when user is owner', async () => {
    const mockList = {
      _id: 'list123',
      name: 'Old Name',
      owner: 'user123',
      save: jest.fn().mockResolvedValue({
        _id: 'list123',
        name: 'New Name',
        owner: 'user123'
      })
    };
    
    ShoppingList.findById.mockResolvedValue(mockList);
    
    const result = await update({
      id: 'list123',
      name: 'New Name',
      user: mockUser
    });
    
    expect(result.name).toBe('New Name');
    expect(mockList.save).toHaveBeenCalled();
  });

  it('should throw error when list not found', async () => {
    ShoppingList.findById.mockResolvedValue(null);
    
    await expect(
      update({
        id: 'nonexistent',
        name: 'New Name',
        user: mockUser
      })
    ).rejects.toThrow('List not found');
  });
  });
});