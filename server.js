const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const trackRoutes = require('./routes/trackRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// CORS configuration - Allow all origins with maximum permissiveness
const corsOptions = {
  origin: true, // Reflect the request origin
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Content-Disposition'],
  preflightContinue: false
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options('*', cors(corsOptions));

// Additional CORS headers middleware to override any server restrictions
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Disposition');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400');
    return res.status(204).json();
  }
  
  next();
});

// Custom CORS headers for static files
app.use('/uploads', cors(corsOptions), express.static('uploads'));

// Middleware - Set maximum limits for file uploads
app.use(helmet()); // Security headers
app.use(morgan('combined')); // Logging

// Set maximum payload size - this is critical for Hostinger
app.use(express.json({ 
  limit: '200mb',
  type: 'application/json'
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '200mb',
  type: 'application/x-www-form-urlencoded'
}));

// Handle raw body for multipart/form-data (file uploads)
app.use(express.raw({ 
  limit: '200mb',
  type: 'multipart/form-data'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    headers: req.headers
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Music Platform API updated 16 oct v3' });
});

// Server port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});