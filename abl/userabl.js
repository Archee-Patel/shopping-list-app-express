const User = require('../models/User');  // MongoDB model
const { sign } = require('../utils/JWT');
const bcrypt = require('bcrypt');

// Add password strength validation
function validatePassword(password) {
  if (!password || password.length < 8) {
    const e = new Error('Password must be at least 8 characters long');
    e.status = 400;
    e.uuAppErrorMap = { 'validation/password-too-short': { type: 'error', message: 'Password must be at least 8 characters long' } };
    throw e;
  }
  
  // Block common weak passwords
  const weakPasswords = ['password123', '12345678', 'admin', 'password', 'test', 'demo'];
  if (weakPasswords.includes(password.toLowerCase())) {
    const e = new Error('Password is too common, please choose a stronger password');
    e.status = 400;
    e.uuAppErrorMap = { 'validation/weak-password': { type: 'error', message: 'Password is too common, please choose a stronger password' } };
    throw e;
  }
}

async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function register({ email, name, password }) {
  // Validate password strength
  validatePassword(password);
  
  // Check if user already exists - MongoDB version
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const e = new Error('User already exists');
    e.status = 409;
    e.uuAppErrorMap = { 'user/already-exists': { type: 'error', message: 'User already exists' } };
    throw e;
  }

  // Hash password securely
  const hashedPassword = await hashPassword(password);
  const user = await User.create({ 
    email, 
    name, 
    password: hashedPassword, 
    profiles: ['Member'] 
  });

  const token = sign({ userId: user._id, email: user.email, profiles: user.profiles });
  
  return { 
    token, 
    user: { id: user._id, email: user.email, name: user.name, profiles: user.profiles },
    uuAppErrorMap: {} 
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const e = new Error('Invalid credentials');
    e.status = 401;
    e.uuAppErrorMap = { 'auth/invalid-credentials': { type: 'error', message: 'Invalid email or password' } };
    throw e;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const e = new Error('Invalid credentials');
    e.status = 401;
    e.uuAppErrorMap = { 'auth/invalid-credentials': { type: 'error', message: 'Invalid email or password' } };
    throw e;
  }

  const token = sign({ userId: user._id, email: user.email, profiles: user.profiles });
  
  return { 
    token, 
    user: { id: user._id, email: user.email, name: user.name, profiles: user.profiles },
    uuAppErrorMap: {} 
  };
}

function assignRole({ userId, role, performedBy }) {
  // We'll update this for MongoDB later
  const e = new Error('Assign role not implemented for MongoDB yet');
  e.status = 501;
  e.uuAppErrorMap = { 'feature/not-implemented': { type: 'error', message: 'Assign role not implemented for MongoDB yet' } };
  throw e;
}

function getCurrentUser(user) {
  return { 
    user: { id: user._id, email: user.email, name: user.name, profiles: user.profiles },
    uuAppErrorMap: {} 
  };
}

module.exports = { register, login, assignRole, getCurrentUser };