const { verify } = require('../utils/JWT');
const User = require('../models/User'); // MongoDB model

module.exports = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      const e = new Error('Bearer token required');
      e.status = 401;
      e.uuAppErrorMap = { 'auth/token-required': { type: 'error', message: 'Bearer token required' } };
      throw e;
    }
    const token = auth.substring(7);
    const payload = verify(token);
    
    // MongoDB version
    const user = await User.findById(payload.userId);
    if (!user) {
      const e = new Error('User not found');
      e.status = 401;
      e.uuAppErrorMap = { 'auth/user-not-found': { type: 'error', message: 'User not found' } };
      throw e;
    }
    req.user = user;
    next();
  } catch (err) {
    if (!err.uuAppErrorMap) err.uuAppErrorMap = { 'auth/invalid-token': { type: 'error', message: err.message } };
    err.status = err.status || 401;
    next(err);
  }
};