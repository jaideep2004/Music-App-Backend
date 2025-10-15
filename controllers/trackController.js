const Track = require('../models/Track');
const { extractAudioMetadata, validateImageDimensions, getImageDimensions } = require('../utils/metadata');
const { uploadMixed } = require('../utils/upload');
const fs = require('fs');
const path = require('path');

// @desc    Get all tracks
// @route   GET /api/tracks
// @access  Public
const getTracks = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const genre = req.query.genre; // Get genre from query parameters
    
    // Build query filter
    let query = {};
    
    // If a specific genre is requested (and it's not one of our special categories)
    if (genre && genre !== 'all' && genre !== 'new' && genre !== 'popular' && genre !== 'featured') {
      query.genre = genre;
    }
    
    // Only fetch standalone singles (tracks with type 'Single' and no album reference)
    // This prevents tracks that belong to albums from appearing on the homepage
    query.$or = [
      { type: 'Single', album: { $exists: false } },  // Singles with no album reference
      { type: 'Single', album: null },                // Singles explicitly set to null
      { type: 'Album' }                               // Albums themselves
    ];
    
    // Get all tracks with pagination
    const tracks = await Track.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });
    
    // For albums, get track counts
    const tracksWithCounts = await Promise.all(tracks.map(async (track) => {
      if (track.type === 'Album') {
        const trackCount = await Track.countDocuments({ album: track._id });
        return {
          ...track.toObject(),
          trackCount
        };
      }
      return track.toObject();
    }));
    
    // Get total count for pagination
    const count = await Track.countDocuments(query);
    
    res.json({
      tracks: tracksWithCounts,
      page,
      pages: Math.ceil(count / pageSize),
      count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search tracks
// @route   GET /api/tracks/search
// @access  Public
const searchTracks = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Build search query
    const searchQuery = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } },
        { 'contributors.name': { $regex: q, $options: 'i' } }
      ],
      $or: [
        { type: 'Single', album: { $exists: false } },  // Singles with no album reference
        { type: 'Single', album: null },                // Singles explicitly set to null
        { type: 'Album' }                               // Albums themselves
      ]
    };
    
    // Get matching tracks with pagination
    const tracks = await Track.find(searchQuery)
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ createdAt: -1 });
    
    // For albums, get track counts
    const tracksWithCounts = await Promise.all(tracks.map(async (track) => {
      if (track.type === 'Album') {
        const trackCount = await Track.countDocuments({ album: track._id });
        return {
          ...track.toObject(),
          trackCount
        };
      }
      return track.toObject();
    }));
    
    // Get total count for pagination
    const count = await Track.countDocuments(searchQuery);
    
    res.json({
      tracks: tracksWithCounts,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single track
// @route   GET /api/tracks/:id
// @access  Public
const getTrackById = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    res.json(track);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Track not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tracks by album ID
// @route   GET /api/tracks/album/:albumId
// @access  Public
const getTracksByAlbumId = async (req, res) => {
  try {
    const tracks = await Track.find({ album: req.params.albumId })
      .sort({ trackNumber: 1 }); // Sort by track number
    
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all unique genres
// @route   GET /api/tracks/genres
// @access  Public
const getGenres = async (req, res) => {
  try {
    const genres = await Track.distinct('genre');
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create track/album
// @route   POST /api/tracks
// @access  Private/Admin
const createTrack = async (req, res) => {
  try {
    // This will be handled by multer middleware
    // Files will be in req.files
    // Text fields will be in req.body
    
    const {
      title,
      type,
      genre,
      contributors,
      listenCount,
      publishDate, // Add publishDate
      bitrate,
      duration,
      sampleRate,
      fileType,
      album,
      trackNumber
    } = req.body;

    // Validate required fields
    if (!title || !type || !genre) {
      return res.status(400).json({ message: 'Title, type, and genre are required' });
    }

    // Parse contributors if it's a string
    let parsedContributors = [];
    if (contributors) {
      try {
        parsedContributors = typeof contributors === 'string' ? JSON.parse(contributors) : contributors;
      } catch (error) {
        parsedContributors = [];
      }
    }

    // Handle file uploads
    let coverImage = '';
    let audioFile = '';
    let coverImageDimensions = { width: 0, height: 0 };
    let audioMetadata = { bitrate: 0, duration: 0, sampleRate: 0, fileType: '' };

    // Process uploaded files
    if (req.files) {
      for (const file of req.files) {
        if (file.fieldname === 'coverImage') {
          // Validate image dimensions
          const isValid = await validateImageDimensions(file.path);
          if (!isValid) {
            // Delete the file
            fs.unlinkSync(file.path);
            return res.status(400).json({ message: 'Cover image must be exactly 3000x3000 pixels' });
          }
          
          // Store only the filename, not the full path
          coverImage = file.filename;
          coverImageDimensions = await getImageDimensions(file.path);
        } else if (file.fieldname === 'audioFile') {
          // Only process audio files for Single tracks
          if (type === 'Single') {
            // Store only the filename, not the full path
            audioFile = file.filename;
            audioMetadata = await extractAudioMetadata(file.path);
          }
        }
      }
    }

    // If no cover image was provided, use a placeholder
    if (!coverImage) {
      coverImage = 'placeholder-image.svg'; // Default placeholder
      coverImageDimensions = { width: 3000, height: 3000 }; // Default dimensions
    }

    // Create track object
    const trackData = {
      title,
      type,
      genre,
      contributors: parsedContributors,
      listenCount: listenCount ? parseInt(listenCount) : 0,
      publishDate: publishDate ? new Date(publishDate) : new Date(), // Add publishDate
      coverImage,
      coverImageDimensions,
      album: album || null, // Set album reference if provided
      trackNumber: trackNumber ? parseInt(trackNumber) : undefined
    };

    // Only add audio-related fields for Single tracks
    if (type === 'Single') {
      trackData.audioFile = audioFile;
      trackData.bitrate = audioMetadata.bitrate || (bitrate ? parseInt(bitrate) : 0);
      trackData.duration = audioMetadata.duration || (duration ? parseInt(duration) : 0);
      trackData.sampleRate = audioMetadata.sampleRate || (sampleRate ? parseInt(sampleRate) : 0);
      trackData.fileType = audioMetadata.fileType || fileType || '';
    }

    const track = new Track(trackData);
    const createdTrack = await track.save();

    res.status(201).json(createdTrack);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update track
// @route   PATCH /api/tracks/:id
// @access  Private/Admin
const updateTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    const {
      title,
      type,
      genre,
      contributors,
      listenCount,
      publishDate
    } = req.body;

    // Parse contributors if it's a string
    let parsedContributors = track.contributors;
    if (contributors) {
      try {
        parsedContributors = typeof contributors === 'string' ? JSON.parse(contributors) : contributors;
      } catch (error) {
        // Keep existing contributors if parsing fails
      }
    }

    track.title = title || track.title;
    track.type = type || track.type;
    track.genre = genre || track.genre;
    track.contributors = parsedContributors;
    track.listenCount = listenCount !== undefined ? parseInt(listenCount) : track.listenCount;
    track.publishDate = publishDate ? new Date(publishDate) : track.publishDate; // Add publishDate

    // Handle file uploads if any
    if (req.files) {
      for (const file of req.files) {
        if (file.fieldname === 'coverImage') {
          // Validate image dimensions
          const isValid = await validateImageDimensions(file.path);
          if (!isValid) {
            // Delete the file
            fs.unlinkSync(file.path);
            return res.status(400).json({ message: 'Cover image must be exactly 3000x3000 pixels' });
          }
          
          // Delete old cover image if exists
          if (track.coverImage && track.coverImage !== 'placeholder-image.svg' && fs.existsSync(`uploads/${track.coverImage}`)) {
            fs.unlinkSync(`uploads/${track.coverImage}`);
          }
          
          // Store only the filename, not the full path
          track.coverImage = file.filename;
          track.coverImageDimensions = await getImageDimensions(file.path);
        } else if (file.fieldname === 'audioFile') {
          // Only process audio files for Single tracks
          if (track.type === 'Single' || type === 'Single') {
            // Delete old audio file if exists
            if (track.audioFile && fs.existsSync(`uploads/${track.audioFile}`)) {
              fs.unlinkSync(`uploads/${track.audioFile}`);
            }
            
            // Store only the filename, not the full path
            track.audioFile = file.filename;
            const audioMetadata = await extractAudioMetadata(file.path);
            track.bitrate = audioMetadata.bitrate;
            track.duration = audioMetadata.duration;
            track.sampleRate = audioMetadata.sampleRate;
            track.fileType = audioMetadata.fileType;
          }
        }
      }
    }

    const updatedTrack = await track.save();
    res.json(updatedTrack);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Track not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete track
// @route   DELETE /api/tracks/:id
// @access  Private/Admin
const deleteTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    // Delete associated files
    if (track.coverImage && fs.existsSync(`uploads/${track.coverImage}`)) {
      fs.unlinkSync(`uploads/${track.coverImage}`);
    }
    
    if (track.audioFile && fs.existsSync(`uploads/${track.audioFile}`)) {
      fs.unlinkSync(`uploads/${track.audioFile}`);
    }
    
    await track.deleteOne();
    res.json({ message: 'Track removed' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Track not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTracks,
  searchTracks,
  getTrackById,
  getTracksByAlbumId,
  getGenres,
  createTrack,
  updateTrack,
  deleteTrack
};