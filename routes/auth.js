
const express = require("express");
const router = express.Router();
const passport = require('../config/passport');
const { sign } = require('../utils/JWT');

// Start Google OAuth - redirects to Google
router.get("/google", 
  passport.authenticate('google', { 
    scope: ['email', 'profile'],
    session: false // Important: no sessions for API
  })
);

// Google OAuth callback - returns JSON with JWT
router.get("/google/callback",
  passport.authenticate('google', { 
    failureRedirect: '/auth/failure',
    session: false // No sessions - we return JWT directly
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = sign({ 
      userId: req.user._id, 
      email: req.user.email, 
     profiles: req.user.profiles 
});
      // Return JSON response with user info and JWT
      res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          profiles: req.user.profiles
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'OAuth authentication failed'
      });
    }
  }
);

// OAuth failure handler - returns JSON
router.get("/failure", (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Google OAuth authentication failed'
  });
});

module.exports = router;