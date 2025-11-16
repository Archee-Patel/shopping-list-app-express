const express = require('express');
const app = express();
const port = 3000;

// Import routes
const shoppingListRoutes = require('./routes/shopping-list');

// Middleware
app.use(express.json());

// Routes
app.use('/shoppinglist-main/:awid', shoppingListRoutes);

// Test endpoint to show available users
app.get('/test-users', (req, res) => {
  const users = require('./config/users');
  res.json({
    users: Object.keys(users).map(key => ({
      token: key,
      profiles: users[key].profiles,
      name: users[key].name
    }))
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`✅ Shopping List Server running on http://localhost:${port}`);
  console.log(`📋 All endpoints available under /shoppinglist-main/{awid}/`);
  console.log(`🔐 Test users available at: http://localhost:${port}/test-users`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
});