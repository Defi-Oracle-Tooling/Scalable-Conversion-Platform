require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { monitoringMiddleware, getSystemHealth } = require('./middleware/monitoring');
const { globalLimiter, apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Only connect to MongoDB if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB
  connectDB();
}

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(monitoringMiddleware); // Add monitoring middleware
app.use(globalLimiter); // Add global rate limiting

// API Rate Limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/conversions', require('./routes/conversions'));
app.use('/api/accounts', require('./routes/accounts'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json(getSystemHealth());
});

// Metrics endpoint (protected, only accessible in non-production)
if (process.env.NODE_ENV !== 'production') {
  app.get('/metrics', (req, res) => {
    res.status(200).json({
      ...getSystemHealth(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      processUptime: process.uptime()
    });
  });
}

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
});

// Only start the server if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app; // For testing
