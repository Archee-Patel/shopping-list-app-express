const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const bcrypt = require('bcrypt');

describe('Users API Integration Tests', () => {
  describe('POST /users/register', () => {
    it('should register a new user (Happy Path)', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({
          email: 'newuser@example.com',
          name: 'New User',
          password: 'SecurePass123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.user).toHaveProperty('name', 'New User');
    });

    it('should return 400 for weak password (Alternative)', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: '123' // Too short
        });
      
      expect(response.status).toBe(400);
    });

    it('should return 409 for duplicate email (Alternative)', async () => {
      // First registration
      await request(app)
        .post('/users/register')
        .send({
          email: 'duplicate@example.com',
          name: 'First User',
          password: 'Password123!'
        });
      
      // Second registration with same email
      const response = await request(app)
        .post('/users/register')
        .send({
          email: 'duplicate@example.com',
          name: 'Second User',
          password: 'Password456!'
        });
      
      expect(response.status).toBe(409);
    });
  });

  describe('POST /users/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      const hashedPassword = await bcrypt.hash('CorrectPass123!', 12);
      await User.create({
        email: 'loginuser@example.com',
        name: 'Login User',
        password: hashedPassword,
        profiles: ['Member']
      });
    });

    it('should login with valid credentials (Happy Path)', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'loginuser@example.com',
          password: 'CorrectPass123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'loginuser@example.com');
    });

    it('should return 401 for invalid password (Alternative)', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'loginuser@example.com',
          password: 'WrongPassword'
        });
      
      expect(response.status).toBe(401);
    });

    it('should return 401 for non-existent user (Alternative)', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword'
        });
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /users/me', () => {
    let authToken;

    beforeEach(async () => {
      const user = await User.create({
        email: 'meuser@example.com',
        name: 'Me User',
        password: 'password123',
        profiles: ['Member']
      });

      // Generate JWT token
      authToken = require('jsonwebtoken').sign(
        { userId: user._id, email: user.email, profiles: user.profiles },
        process.env.JWT_SECRET,
        { expiresIn: '1h', issuer: 'shopping-list-app' }
      );
    });

    it('should get current user (Happy Path)', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('email', 'meuser@example.com');
      expect(response.body.user).toHaveProperty('name', 'Me User');
    });

    it('should return 401 without token (Alternative)', async () => {
      const response = await request(app)
        .get('/users/me');
      
      expect(response.status).toBe(401);
    });
  });
});