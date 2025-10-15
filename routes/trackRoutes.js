const express = require('express');
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
  .post(auth, uploadMixed.any(), createTrack);

router.route('/:id')
  .patch(auth, uploadMixed.any(), updateTrack)
  .delete(auth, deleteTrack);

module.exports = router;