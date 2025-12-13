
// Mock environment -- set before requiring the module so it reads the right SECRET
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
const jwt = require('jsonwebtoken');
const { sign, verify } = require('../../../utils/JWT');

describe('JWT Utils', () => {
  describe('sign', () => {
    it('should sign a payload and return token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = sign(payload);
      
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });
  });

  describe('verify', () => {
    it('should verify a valid token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h', issuer: 'shopping-list-app' }
      );
      
      const decoded = verify(token);
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.iss).toBe('shopping-list-app');
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verify('invalid.token.here');
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      const payload = { userId: '123' };
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '-1h', issuer: 'shopping-list-app' }
      );
      
      expect(() => {
        verify(token);
      }).toThrow();
    });

    it('should throw error for wrong issuer', () => {
      const payload = { userId: '123' };
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h', issuer: 'wrong-issuer' }
      );
      
      expect(() => {
        verify(token);
      }).toThrow();
    });
  });
});