const User = require('../models/User');

const initializeUsers = async () => {
  try {
    await User.create('admin', 'admin123', ['Authority']);
    await User.create('owner', 'owner123', ['Owner']);
    await User.create('member', 'member123', ['Member']);
    console.log('✅ Default users: admin/admin123, owner/owner123, member/member123');
  } catch (error) {
    console.log('ℹ️ Users already exist');
  }
};

module.exports = initializeUsers;