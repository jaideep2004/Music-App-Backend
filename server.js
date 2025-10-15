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
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow frontend origins
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware to all routes
app.use(cors(corsOptions));

// Custom CORS headers for static files
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static('uploads'));

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Music Platform API' });
});

// Server port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});