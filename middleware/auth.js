const users = require('../config/users');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({
      uuAppErrorMap: {
        'auth/unauthorized': {
          type: 'error',
          message: 'Authentication required. Use Authorization header with user token'
        }
      }
    });
  }
  
  const user = users[token];
  if (!user) {
    return res.status(401).json({
      uuAppErrorMap: {
        'auth/invalid-token': {
          type: 'error',
          message: 'Invalid authentication token. Use: user-owner, user-member, or user-admin'
        }
      }
    });
  }
  
  req.user = user;
  next();
};

module.exports = authenticate;