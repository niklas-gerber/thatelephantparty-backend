const express = require('express');
const router = express.Router();
const authLimiter = require('../middleware/authLimiter');
const { generateToken } = require('../utils/jwtUtils');
const { AuthError } = require('../errors/customErrors');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');

// Login/Logout for Admin to get authenticated for protected routes

// POST /api/v1/auth/login
router.post('/login', authLimiter, catchAsync(async (req, res) => {
  const { username, password } = req.body;
  const user = await AdminUser.findOne({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AuthError('Invalid credentials');
  }
  const token = generateToken(username);
  
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000 // 1 hour
  });

  res.json({ success: true });
}));

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.json({ success: true });
});

module.exports = router;