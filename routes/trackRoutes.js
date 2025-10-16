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
router.route('/')
  .post(auth, (req, res, next) => {
    uploadMixed.any()(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ message: 'File too large. Maximum file size is 200MB.' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  }, createTrack);

router.route('/:id')
  .patch(auth, (req, res, next) => {
    uploadMixed.any()(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ message: 'File too large. Maximum file size is 200MB.' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  }, updateTrack)
  .delete(auth, deleteTrack);

module.exports = router;