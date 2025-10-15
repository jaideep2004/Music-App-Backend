const mm = require('music-metadata');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // For image processing

/**
 * Extract metadata from audio file
 * @param {string} filePath - Path to the audio file
 * @returns {Object} Metadata object
 */
const extractAudioMetadata = async (filePath) => {
  try {
    const metadata = await mm.parseFile(filePath);
    
    return {
      bitrate: metadata.format.bitrate ? Math.round(metadata.format.bitrate / 1000) : 0, // in kbps
      duration: metadata.format.duration ? Math.round(metadata.format.duration) : 0, // in seconds
      sampleRate: metadata.format.sampleRate || 0, // in Hz
      fileType: metadata.format.container || path.extname(filePath).substring(1),
      title: metadata.common.title || '',
      artist: metadata.common.artist || '',
      album: metadata.common.album || '',
      year: metadata.common.year || ''
    };
  } catch (error) {
    throw new Error(`Error extracting audio metadata: ${error.message}`);
  }
};

/**
 * Validate and get image dimensions
 * @param {string} imagePath - Path to the image file
 * @returns {Object} Dimensions object with width and height
 */
const getImageDimensions = async (imagePath) => {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    return {
      width: metadata.width,
      height: metadata.height
    };
  } catch (error) {
    throw new Error(`Error getting image dimensions: ${error.message}`);
  }
};

/**
 * Validate image dimensions (must be exactly 3000x3000)
 * @param {string} imagePath - Path to the image file
 * @returns {boolean} True if dimensions are valid
 */
const validateImageDimensions = async (imagePath) => {
  try {
    const dimensions = await getImageDimensions(imagePath);
    return dimensions.width === 3000 && dimensions.height === 3000;
  } catch (error) {
    throw new Error(`Error validating image dimensions: ${error.message}`);
  }
};

module.exports = {
  extractAudioMetadata,
  getImageDimensions,
  validateImageDimensions
};