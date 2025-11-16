const jwt = require('jsonwebtoken');

const JWT_SECRET = 'shopping-list-secret-key';
const JWT_EXPIRES_IN = '1h';

class JWTService {
  static generateToken(user) {
    const payload = {
      userId: user.id,
      username: user.username,
      profiles: user.profiles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    };
    
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'shopping-list-app'
    });
  }

  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'shopping-list-app'
      });
      
      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        throw new Error('Token has expired');
      }
      
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }
}

module.exports = JWTService;