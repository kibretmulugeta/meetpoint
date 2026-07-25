const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper to sign JWT token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_123456789';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '7d',
  });
};

/**
 * @route   GET /auth/google
 * @desc    Initiates Google OAuth 2.0 authentication flow
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);

/**
 * @route   GET /auth/google/callback
 * @desc    Handles Google OAuth callback, creates/fetches user, issues JWT in HttpOnly cookie
 * @access  Public
 */
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err || !user) {
        console.error('[OAuth Callback Error]:', err || info);
        return res.redirect('/?error=authentication_failed');
      }

      try {
        // Generate JWT token with MongoDB internal _id
        const token = generateToken(user._id);

        // Set HttpOnly Cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.redirect('/dashboard');
      } catch (tokenError) {
        console.error('[Token Generation Error]:', tokenError);
        return res.redirect('/?error=session_error');
      }
    })(req, res, next);
  }
);

/**
 * @route   GET /auth/me
 * @desc    Fetch authenticated user profile details from HttpOnly cookie
 * @access  Private (Protected by JWT)
 */
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      googleId: req.user.googleId,
      email: req.user.email,
      displayName: req.user.displayName,
      avatarUrl: req.user.avatarUrl,
      createdAt: req.user.createdAt,
    },
  });
});

/**
 * @route   GET /auth/logout
 * @desc    Clears JWT session cookie and redirects user to login page
 * @access  Public / Private
 */
router.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.redirect('/');
});

module.exports = router;
