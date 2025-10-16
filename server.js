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

// CORS configuration - Allow all origins
app.use(cors());

// Custom CORS headers for static files
app.use('/uploads', cors(), express.static('uploads'));

// Middleware - Set limits for file uploads
app.use(helmet()); // Security headers
app.use(morgan('combined')); // Logging
app.use(express.json()); // Increase JSON body limit
app.use(express.urlencoded({ extended: true })); // Increase URL encoded data limit

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Music Platform API updated 16 oct v4' });
});

// Server port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});