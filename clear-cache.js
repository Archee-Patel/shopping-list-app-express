
const mongoose = require('mongoose');
require('dotenv').config();

async function clearCache() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Clear Mongoose model cache for User
  delete mongoose.connection.models['User'];
  
  console.log('✅ Cleared Mongoose User model cache');
  
  // Drop the entire users collection to start fresh
  await mongoose.connection.db.collection('users').drop().catch(() => {
    console.log('Users collection already dropped or does not exist');
  });
  
  console.log('✅ Users collection dropped - schema cache cleared');
  process.exit();
}

clearCache();