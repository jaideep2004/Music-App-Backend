const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerUser); 
router.post('/login', loginUser);

// Private route
router.get('/me', auth, getMe);

module.exports = router;