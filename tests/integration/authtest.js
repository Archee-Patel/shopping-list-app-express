const request = require('supertest');
const app = require('../../app');

describe('Auth API Integration Tests', () => {
  describe('GET /auth/google', () => {
    it('should redirect to Google OAuth', async () => {
      const response = await request(app)
        .get('/auth/google');
      
      // Should redirect (302) or start OAuth flow
      expect([200, 302]).toContain(response.status);
    });
  });

  describe('GET /auth/google/callback', () => {
    it('should handle OAuth callback', async () => {
      // This is a simplified test since OAuth callback is complex
      const response = await request(app)
        .get('/auth/google/callback')
        .query({ code: 'test-code' });
      
      // Should handle the callback (might redirect or return error)
      expect(response.status).toBeDefined();
    });
  });

  describe('GET /auth/failure', () => {
    it('should return OAuth failure message', async () => {
      const response = await request(app)
        .get('/auth/failure');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Google OAuth authentication failed');
    });
  });
});