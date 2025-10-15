const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingUser = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingUser) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user - let the model handle password hashing
    const adminUser = new User({
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'admin@321', // Plain text password - will be hashed by the model
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seed function
const run = async () => {
  await connectDB();
  await createAdminUser();
};

run();