
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'dev-secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN, issuer: 'shopping-list-app' });
}

function verify(token) {
  try {
    return jwt.verify(token, SECRET, { issuer: 'shopping-list-app' });
  } catch (err) {
    const e = new Error(err.message);
    e.status = 401;
    throw e;
  }
}

module.exports = { sign, verify };
