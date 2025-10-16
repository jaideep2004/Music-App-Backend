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

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'https://orangemusicindia.com', 'https://music-app-backend.cloud'], // Allow frontend origins
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware with options to all routes
app.use(cors(corsOptions));

// Custom CORS headers for static files
app.use('/uploads', cors(corsOptions), express.static('uploads'));

// Middleware - No limits
app.use(helmet()); // Security headers
app.use(morgan('combined')); // Logging
app.use(express.json()); // No limit for JSON bodies
app.use(express.urlencoded({ extended: true })); // No limit for URL encoded data

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Music Platform API updated 16 oct v3' });
});

// Server port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});