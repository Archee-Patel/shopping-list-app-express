
const userAbl = require('../../../abl/userabl');
const User = require('../../../models/User');
const bcrypt = require('bcrypt');
const { sign } = require('../../../utils/JWT');

// Mock dependencies
jest.mock('../../../models/User');
jest.mock('bcrypt');
jest.mock('../../../utils/JWT');

describe('User ABL', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    describe('Happy Path', () => {
      it('should successfully register a new user', async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashedPassword123');
        
        const mockUser = {
          _id: 'user123',
          email: 'new@example.com',
          name: 'New User',
          profiles: ['Member']
        };
        
        User.create.mockResolvedValue(mockUser);
        sign.mockReturnValue('jwt-token-123');
        
        const result = await userAbl.register({
          email: 'new@example.com',
          name: 'New User',
          password: 'ValidPass123!'
        });
        
        expect(result).toEqual({
          token: 'jwt-token-123',
          user: {
            id: 'user123',
            email: 'new@example.com',
            name: 'New User',
            profiles: ['Member']
          },
          uuAppErrorMap: {}
        });
      });
    });

    describe('Alternative Scenarios', () => {
      it('should throw error when user already exists', async () => {
        const existingUser = {
          _id: 'existing123',
          email: 'existing@example.com'
        };
        
        User.findOne.mockResolvedValue(existingUser);
        
        await expect(
          userAbl.register({
            email: 'existing@example.com',
            name: 'Existing User',
            password: 'ValidPassword123!'
          })
        ).rejects.toThrow('User already exists');
      });

      it('should throw error for weak password', async () => {
        await expect(
          userAbl.register({
            email: 'test@example.com',
            name: 'Test User',
            password: '123'
          })
        ).rejects.toThrow('Password must be at least 8 characters long');
      });

      it('should throw error for common password', async () => {
        await expect(
          userAbl.register({
            email: 'test@example.com',
            name: 'Test User',
            password: 'password123'
          })
        ).rejects.toThrow('Password is too common');
      });
    });
  });

  describe('login', () => {
    describe('Happy Path', () => {
      it('should successfully login with valid credentials', async () => {
        const mockUser = {
          _id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          profiles: ['Member'],
          password: 'hashedPassword123'
        };
        
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        sign.mockReturnValue('jwt-token-123');
        
        const result = await userAbl.login({
          email: 'test@example.com',
          password: 'correctPassword'
        });
        
        expect(result).toEqual({
          token: 'jwt-token-123',
          user: {
            id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            profiles: ['Member']
          },
          uuAppErrorMap: {}
        });
      });
    });

    describe('Alternative Scenarios', () => {
      it('should throw error for invalid email', async () => {
        User.findOne.mockResolvedValue(null);
        
        await expect(
          userAbl.login({
            email: 'nonexistent@example.com',
            password: 'password123'
          })
        ).rejects.toThrow('Invalid credentials');
      });

      it('should throw error for invalid password', async () => {
        const mockUser = {
          _id: 'user123',
          email: 'test@example.com',
          password: 'hashedPassword123'
        };
        
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);
        
        await expect(
          userAbl.login({
            email: 'test@example.com',
            password: 'wrongPassword'
          })
        ).rejects.toThrow('Invalid credentials');
      });
    });
  });
});