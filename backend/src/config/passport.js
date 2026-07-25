const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const configurePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID || 'dummy_id';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret';
  const callbackURL = `${process.env.API_URL || 'http://localhost:8000'}/api/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: '/api/auth/google/callback',
        proxy: true,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
          const displayName = profile.displayName || 'Google User';
          const profilePicture = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

          // Check if user already exists in database
          let user = await User.findOne({ googleId });

          if (user) {
            return done(null, user);
          }

          // Auto-register user if not present
          user = await User.create({
            googleId,
            email,
            displayName,
            profilePicture,
            authProvider: 'google'
          });

          return done(null, user);
        } catch (error) {
          console.error('[Passport] Strategy Error:', error);
          return done(error, null);
        }
      }
    )
  );
};

module.exports = configurePassport;
