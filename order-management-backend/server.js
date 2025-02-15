const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Initialize Express app
const app = express();
const routes = require('./routes/index'); // Path to your index.js in the routes folder

// Middleware
app.use(express.json()); // Parses JSON bodies
app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Use trusted origins in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.set('query parser', 'extended'); // Allow encoded slashes
//app.set('strict routing', true); // Strict route matching

// Request Logging
app.use((req, _res, next) => {
  console.log(`Request received: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  if (req.method !== 'GET') {
    console.log('Body:', req.body);
  }
  next();
});

// Database Connection
connectDB();

// Routes
app.use('/api', routes); // Prefix all routes with /api
app.use((req, _res, next) => {
  console.log(`Global Middleware: ${req.method} ${req.originalUrl}`);
  next();
});

// Error Handling Middleware
app.use((err, _req, res, next) => {
  console.error('Error Middleware:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
