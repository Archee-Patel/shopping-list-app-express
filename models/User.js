
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { 
    type: String, 
    required: function() {
      return !this.googleId;
    } 
  },
  googleId: { type: String },
  profiles: { 
    type: [String], 
    default: ['Member'],
    enum: ['Authority', 'Owner', 'Member'] // ✅ MUST BE THESE EXACT VALUES
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);