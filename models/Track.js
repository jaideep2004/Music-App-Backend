const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Artist', 'Producer', 'Composer', 'Lyricist', 'Arranger', 'Engineer', 'Performer', 'Writer', 'Other']
  }
});

const trackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Single', 'Album'],
    default: 'Single'
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  contributors: [contributorSchema],
  listenCount: {
    type: Number,
    default: 0
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  releaseDate: {
    type: Date
  },
  coverImage: {
    type: String, // URL to the image
    required: false // Not required since we provide a placeholder
  },
  coverImageDimensions: {
    width: {
      type: Number,
      required: function() {
        // Only required when coverImage is provided and not the placeholder
        return !!this.coverImage && this.coverImage !== 'placeholder-image.svg';
      }
    },
    height: {
      type: Number,
      required: function() {
        // Only required when coverImage is provided and not the placeholder
        return !!this.coverImage && this.coverImage !== 'placeholder-image.svg';
      }
    }
  },
  audioFile: {
    type: String, // URL to the audio file
    required: function() {
      // Only required for Single tracks, not for Albums
      return this.type === 'Single';
    }
  },
  bitrate: {
    type: Number, // in kbps
    required: function() {
      // Only required for Single tracks, not for Albums
      return this.type === 'Single';
    }
  },
  duration: {
    type: Number, // in seconds
    required: function() {
      // Only required for Single tracks, not for Albums
      return this.type === 'Single';
    }
  },
  sampleRate: {
    type: Number, // in Hz
    required: function() {
      // Only required for Single tracks, not for Albums
      return this.type === 'Single';
    }
  },
  fileType: {
    type: String, // mp3, flac, wav, aac
    required: function() {
      // Only required for Single tracks, not for Albums
      return this.type === 'Single';
    }
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track' // Reference to the album if this is a track in an album
  },
  trackNumber: {
    type: Number // Track number in album
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Track', trackSchema);