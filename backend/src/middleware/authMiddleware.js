const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no session token provided.' });
    }

    const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_123456789';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-__v');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or invalid session.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Verification failed:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token validation failed.' });
  }
};

module.exports = { protect };
