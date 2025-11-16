const JWTService = require('../utils/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        uuAppErrorMap: {
          'auth/token-required': {
            type: 'error',
            message: 'Bearer token required'
          }
        }
      });
    }

    const token = authHeader.substring(7);
    const decoded = JWTService.verifyToken(token);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        uuAppErrorMap: {
          'auth/user-not-found': {
            type: 'error',
            message: 'User not found'
          }
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      uuAppErrorMap: {
        'auth/invalid-token': {
          type: 'error',
          message: error.message
        }
      }
    });
  }
};

module.exports = authenticate;