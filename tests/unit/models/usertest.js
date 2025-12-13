
const mongoose = require('mongoose');
const User = require('../../../models/User');

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should require email field', async () => {
      const user = new User({
        name: 'Test User',
        password: 'password123'
      });
      
      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require unique email', async () => {
      await User.create({
        email: 'test@example.com',
        name: 'User 1',
        password: 'password123'
      });

      const user2 = new User({
        email: 'test@example.com',
        name: 'User 2',
        password: 'password456'
      });

      await expect(user2.save()).rejects.toThrow(/duplicate key error/);
    });

    it('should validate password when googleId is not present', async () => {
      const user = new User({
        email: 'test@example.com',
        name: 'Test User'
        // No password
      });
      
      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should not require password when googleId is present', async () => {
      const user = new User({
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'google123'
      });
      
      await expect(user.save()).resolves.toBeTruthy();
    });

    it('should enforce profiles enum values', async () => {
      const user = new User({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        profiles: ['InvalidRole']
      });
      
      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should default to Member profile', async () => {
      const user = await User.create({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      });
      
      expect(user.profiles).toEqual(['Member']);
    });
  });

  describe('Instance Methods', () => {
    let user;
    
    beforeEach(async () => {
      user = await User.create({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        profiles: ['Member']
      });
    });

    it('should have timestamps', () => {
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should have correct fields', () => {
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.profiles).toEqual(['Member']);
    });
  });
});