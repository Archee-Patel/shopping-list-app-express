
const mongoose = require('mongoose');
const { ShoppingList } = require('../../../models/ShoppingList');

describe('ShoppingList Model', () => {
  it('should require name field', async () => {
    const list = new ShoppingList({
      owner: new mongoose.Types.ObjectId()
    });
    
    await expect(list.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should require owner field', async () => {
    const list = new ShoppingList({
      name: 'Test List'
    });
    
    await expect(list.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should create list with owner', async () => {
    const ownerId = new mongoose.Types.ObjectId();
    const list = await ShoppingList.create({
      name: 'My Shopping List',
      owner: ownerId,
      members: [{ user: ownerId, role: 'Owner' }]
    });
    
    expect(list.name).toBe('My Shopping List');
    expect(list.owner.toString()).toBe(ownerId.toString());
    expect(list.members[0].role).toBe('Owner');
  });

  it('should have timestamps', async () => {
    const ownerId = new mongoose.Types.ObjectId();
    const list = await ShoppingList.create({
      name: 'Test List',
      owner: ownerId
    });
    
    expect(list.createdAt).toBeInstanceOf(Date);
    expect(list.updatedAt).toBeInstanceOf(Date);
  });
});