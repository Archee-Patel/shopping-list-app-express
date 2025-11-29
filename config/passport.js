
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  },
  async (request, accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth Profile:', profile);
      
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user exists with same email (merge accounts)
      user = await User.findOne({ email: profile.email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }
      
      // Create new user with Google OAuth - NO PASSWORD for OAuth users
      user = await User.create({
        googleId: profile.id,
        email: profile.email,
        name: profile.displayName,
        profiles: ['Member'] // ✅ Use 'Member' instead of 'User'
      });
      
      return done(null, user);
    } catch (error) {
      console.error('Passport Google OAuth Error:', error);
      return done(error, null);
    }
  }
));

// For API, we don't need serialize/deserialize since we're not using sessions
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;