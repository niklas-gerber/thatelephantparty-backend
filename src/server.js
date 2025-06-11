const express = require('express');
const cookieParser = require('cookie-parser');
const { sequelize, testConnection } = require('./db');
const app = express();
const initAdmin = require('./scripts/initAdmin');
const helmet = require('helmet');
app.set('trust proxy', 1);

// Core Middleware
app.use(cookieParser());
app.use(express.json());

// helmet Default XSS Protection
app.use(helmet());

// Rate Limiters
const apiLimiter = require('./middleware/apiLimiter');
app.use('/api/v1/public', apiLimiter); 

// ---- Routes ----
// Quick Test
app.get('/', (req, res) => {
  res.send('That Elephant Party API is working!');
});

// Authentication and Admin Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/admin', require('./routes/private/adminRoutes'));

// Static Page Content
const staticContentRoutes = require('./routes/public/staticContentRoutes');
app.use('/api/v1/public/pages', staticContentRoutes);

// Event Routes for dynamic conten
const eventRoutes = require('./routes/public/eventRoutes');
app.use('/api/v1/public/events', eventRoutes); 

// Ticket Routes for Ticket Purchases
const ticketRoutes = require('./routes/public/ticketRoutes');
app.use('/api/v1/public/events', ticketRoutes); // Merges with eventRoutes


// Serve static uploads (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static('private/uploads')); // Payslips
  app.use('/posters', express.static('public/posters')); // Posters
}

// Error Handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler); // Catches all errors

// AWS-style startup sequence 
async function startServer() {
  await testConnection();
  await sequelize.sync({ alter: true }); // Creates tables if missing - CHANGE FOR PRODUCTION
  await initAdmin(); // After DB sync
  console.log('Database tables synchronized + admin initialized');
  app.listen(3000, () => {
    console.log('Server + DB ready on port 3000');
  });
}

startServer();