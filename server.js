const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const trackRoutes = require("./routes/trackRoutes");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://orangemusicindia.com",
    "https://audiolibrary.singleaudio.com",
    "https://audiolibrary.karharimedia.com",
    "https://music-app-backend.cloud",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middleware
app.use(morgan("combined")); // Logging
app.use(express.json({ limit: "200mb" })); // Parse JSON bodies
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files middleware
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tracks", trackRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Music Platform API updated 19 oct" });
});

// Server port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
