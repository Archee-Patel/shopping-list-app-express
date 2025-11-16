const express = require('express');
const app = express();
const port = 3000;

// Import modules
const User = require('./models/User');
const JWTService = require('./utils/jwt');
const authenticate = require('./middleware/auth');
const initializeUsers = require('./config/initialUsers');
const shoppingListRoutes = require('./routes/shopping-list');

app.use(express.json());
initializeUsers();

// ==================== AUTHENTICATION ENDPOINTS ====================

// USER REGISTRATION - User Management
app.post('/register', async (req, res) => {
  try {
    const { username, password, profiles } = req.body;
    
    // INPUT VALIDATION
    if (!username || !password) {
      return res.status(400).json({
        uuAppErrorMap: { 'validation/credentials-required': { type: 'error', message: 'Username and password required' } }
      });
    }

    // USER CREATION - User Management
    const user = await User.create(username, password, profiles || ['Member']);
    
    res.status(201).json({
      id: user.id,
      username: user.username,
      profiles: user.profiles,
      message: 'User registered successfully'
    });
  } catch (error) {
    // ERROR HANDLING
    res.status(400).json({
      uuAppErrorMap: { 'auth/registration-failed': { type: 'error', message: error.message } }
    });
  }
});

// USER LOGIN - Authentication
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // INPUT VALIDATION
    if (!username || !password) {
      return res.status(400).json({
        uuAppErrorMap: { 'validation/credentials-required': { type: 'error', message: 'Username and password required' } }
      });
    }

    // CREDENTIAL VALIDATION - Authentication
    const user = await User.validateCredentials(username, password);
    if (!user) {
      return res.status(401).json({
        uuAppErrorMap: { 'auth/invalid-credentials': { type: 'error', message: 'Invalid credentials' } }
      });
    }

    // TOKEN ISSUANCE - Authentication with expiration
    const token = JWTService.generateToken(user);
    
    res.json({
      id: user.id,
      username: user.username,
      profiles: user.profiles,
      token: token,
      tokenType: 'Bearer',
      expiresIn: '1 hour'
    });
  } catch (error) {
    // ERROR HANDLING
    res.status(500).json({
      uuAppErrorMap: { 'auth/login-failed': { type: 'error', message: 'Login failed' } }
    });
  }
});

// ==================== PROTECTED ROUTES ====================

app.use('/shoppinglist-main/:awid', authenticate, shoppingListRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`✅ Shopping List Server: http://localhost:${port}`);
  console.log(`🔐 COMPLETE IMPLEMENTATION:`);
  console.log(`   ✅ User Management (Registration/Login)`);
  console.log(`   ✅ Authentication (Credential validation + JWT tokens)`);
  console.log(`   ✅ Authorization (3 Profiles: Authority/Owner/Member)`);
  console.log(`   ✅ Input Validation`);
  console.log(`   ✅ Error Handling (uuAppErrorMap)`);
  console.log(`   ✅ 11 Protected Endpoints`);
});