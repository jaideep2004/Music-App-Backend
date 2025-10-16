const multer = require('multer');
const path = require('path');

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store files in uploads directory
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for audio files
const audioFileFilter = (req, file, cb) => {
  // Accept audio files only
  if (
    file.mimetype === 'audio/mpeg' ||  // mp3
    file.mimetype === 'audio/flac' ||  // flac
    file.mimetype === 'audio/wav' ||   // wav
    file.mimetype === 'audio/aac'      // aac
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files (mp3, flac, wav, aac) are allowed'), false);
  }
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
  // Accept image files only
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, jpg) are allowed'), false);
  }
};

// Multer upload instances - Set maximum limits
const uploadAudio = multer({ 
  storage: storage,
  fileFilter: audioFileFilter,
  limits: { 
    fileSize: 200 * 1024 * 1024, // 200MB limit for audio files
    files: 1, // Only allow 1 file per request
    fieldSize: 200 * 1024 * 1024 // Field size limit
  }
});

const uploadImage = multer({ 
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB limit for image files
    files: 1, // Only allow 1 file per request
    fieldSize: 50 * 1024 * 1024 // Field size limit
  }
});

// Multer upload for mixed files (audio + image) - Set maximum limits
const uploadMixed = multer({ 
  storage: storage,
  limits: { 
    fileSize: 200 * 1024 * 1024, // 200MB limit for mixed files
    files: 10, // Allow up to 10 files per request (for albums)
    fieldSize: 200 * 1024 * 1024 // Field size limit
  }
});

module.exports = {
  uploadAudio,
  uploadImage,
  uploadMixed
};