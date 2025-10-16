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
  origin: ['http://localhost:5173', 'https://orangemusicindia.com'], // Allow frontend origins
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware to all routes
app.use(cors(corsOptions));

// Static files middleware (without custom CORS headers to avoid duplication)
app.use('/uploads', express.static('uploads'));

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '200mb' })); // Parse JSON bodies
// app.use(express.urlencoded({ extended: true, limit: '50mb' })); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Music Platform API updated 16 oct' });
});

// Server port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});