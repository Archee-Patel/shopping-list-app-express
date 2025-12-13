const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { ShoppingList } = require('../../models/ShoppingList');
const jwt = require('jsonwebtoken');

describe('Shopping List API Integration Tests', () => {
  let authToken;
  let userId;
  let listId;
  const awid = 'archh2401';

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({
      email: 'test-shopping@example.com',
      name: 'Test Shopping User',
      password: 'password123',
      profiles: ['Member']
    });

    userId = user._id;

    // Generate JWT token
    authToken = jwt.sign(
      { userId: user._id, email: user.email, profiles: user.profiles },
      process.env.JWT_SECRET,
      { expiresIn: '1h', issuer: 'shopping-list-app' }
    );
    // Create a shopping list to use for item/add and delete tests
    const list = await ShoppingList.create({
      name: 'My Grocery List',
      owner: user._id,
      members: []
    });
    listId = list._id;
  });

  describe('POST /shoppinglist-main/:awid/create', () => {
    it('should create a shopping list (Happy Path)', async () => {
      const response = await request(app)
        .post(`/shoppinglist-main/${awid}/create`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My Grocery List'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'My Grocery List');
      expect(response.body).toHaveProperty('owner');
      
      // Save list ID for other tests
      listId = response.body._id;
    });

    it('should return 401 without authentication (Alternative)', async () => {
      const response = await request(app)
        .post(`/shoppinglist-main/${awid}/create`)
        .send({
          name: 'Unauthorized List'
        });
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /shoppinglist-main/:awid/list', () => {
    it('should retrieve shopping lists (Happy Path)', async () => {
      const response = await request(app)
        .get(`/shoppinglist-main/${awid}/list`)
        .query({ page: 0, pageSize: 10 })
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('lists');
      expect(Array.isArray(response.body.lists)).toBe(true);
    });

    it('should handle invalid pagination gracefully', async () => {
      const response = await request(app)
        .get(`/shoppinglist-main/${awid}/list`)
        .query({ page: -1, pageSize: 1000 })
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
    });
  });

  describe('POST /shoppinglist-main/:awid/item/add', () => {
    it('should add item to shopping list (Happy Path)', async () => {
      const response = await request(app)
        .post(`/shoppinglist-main/${awid}/item/add`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shoppingListId: listId,
          name: 'Milk',
          quantity: 2
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Milk');
      expect(response.body).toHaveProperty('quantity', 2);
    });

    it('should return 404 for non-existent list (Alternative)', async () => {
      const response = await request(app)
        .post(`/shoppinglist-main/${awid}/item/add`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shoppingListId: '507f1f77bcf86cd799439011',
          name: 'Bread'
        });
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /shoppinglist-main/:awid/delete', () => {
    it('should delete shopping list (Happy Path)', async () => {
      const response = await request(app)
        .post(`/shoppinglist-main/${awid}/delete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: listId
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deleted', true);
    });
  });
});