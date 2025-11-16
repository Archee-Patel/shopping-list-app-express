const bcrypt = require('bcryptjs');
const usersDB = {};

class User {
  static async create(username, password, profiles = ['Member']) {
    if (!username || !password) throw new Error('Username and password required');
    if (usersDB[username]) throw new Error('User already exists');
    if (username.length < 3) throw new Error('Username min 3 characters');
    if (password.length < 6) throw new Error('Password min 6 characters');

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
      id: `user-${Date.now()}`,
      username,
      password: hashedPassword,
      profiles: Array.isArray(profiles) ? profiles : [profiles],
      createdAt: new Date()
    };
    
    usersDB[username] = user;
    usersDB[user.id] = user;
    return { ...user, password: undefined };
  }

  static async findByUsername(username) {
    const user = usersDB[username];
    return user ? { ...user, password: undefined } : null;
  }

  static async findById(userId) {
    const user = usersDB[userId];
    return user ? { ...user, password: undefined } : null;
  }

  static async validateCredentials(username, password) {
    const user = usersDB[username];
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? { ...user, password: undefined } : null;
  }
}

module.exports = User;