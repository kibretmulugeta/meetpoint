const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');

dotenv.config();

const connectDB = require('./config/db');
const configurePassport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointments');
const mapRoutes = require('./routes/maps');
const contactRoutes = require('./routes/contacts');
const notificationRoutes = require('./routes/notifications');

connectDB();
configurePassport();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(passport.initialize());

// API Routes
try {
  app.use('/api/auth', authRoutes);
  app.use('/api/appointments', appointmentRoutes);
  if (typeof mapRoutes === 'function') {
    app.use('/api/maps', mapRoutes);
  }
  app.use('/api/contacts', contactRoutes);
  app.use('/api/notifications', notificationRoutes);
} catch (e) {
  console.error("FATAL ROUTE REGISTRATION ERROR:", e);
}

// Global Error Handling
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;
