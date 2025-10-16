const express = require('express');
const multer = require('multer');
const { 
  getTracks, 
  searchTracks,
  getTrackById, 
  getTracksByAlbumId,
  getGenres, // Add this new function
  createTrack, 
  updateTrack, 
  deleteTrack 
} = require('../controllers/trackController');
const { uploadMixed } = require('../utils/upload');
const auth = require('../middleware/auth');

const router = express.Router();  

// Public routes
// More specific routes should come before general ones
router.route('/genres')
  .get(getGenres);

router.route('/search')
  .get(searchTracks);

router.route('/album/:albumId')
  .get(getTracksByAlbumId);

router.route('/:id')
  .get(getTrackById);

router.route('/')
  .get(getTracks);

// Private/Admin routes
// Custom middleware to handle CORS and multer errors properly
const handleUpload = (req, res, next) => {
  // Apply CORS headers before multer
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Disposition');
  
  uploadMixed.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        // Ensure CORS headers are set even in error responses
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        return res.status(413).json({ 
          message: 'File too large. Maximum file size is 200MB.',
          error: 'FILE_TOO_LARGE'
        });
      }
      // Ensure CORS headers are set even in error responses
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      return res.status(400).json({ 
        message: err.message,
        error: 'UPLOAD_ERROR'
      });
    } else if (err) {
      // Ensure CORS headers are set even in error responses
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      return res.status(400).json({ 
        message: err.message,
        error: 'UPLOAD_ERROR'
      });
    }
    next();
  });
};

router.route('/')
  .post(auth, handleUpload, createTrack);

router.route('/:id')
  .patch(auth, handleUpload, updateTrack)
  .delete(auth, deleteTrack);

module.exports = router;