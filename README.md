# Music Platform Backend API

This is the backend API for the Music Platform application, built with Node.js, Express, and MongoDB.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new admin user
- `POST /api/auth/login` - Login as admin
- `GET /api/auth/me` - Get current user info (requires auth)

### Tracks
- `GET /api/tracks` - Get all tracks (paginated)
- `GET /api/tracks/:id` - Get a specific track
- `POST /api/tracks` - Create a new track/album (requires auth)
- `PATCH /api/tracks/:id` - Update a track/album (requires auth)
- `DELETE /api/tracks/:id` - Delete a track/album (requires auth)

## File Uploads

The API supports uploading audio files and cover images:
- Audio files: mp3, flac, wav, aac (max 100MB)
- Cover images: jpg, png, jpeg (must be exactly 3000x3000px)

## Audio Metadata

The system automatically extracts metadata from uploaded audio files:
- Bitrate (kbps)
- Duration (seconds)
- Sample rate (Hz)
- File type

## AWS Integration

The system is designed to support AWS S3 for file storage in the future by updating the upload utilities.

## Dependencies

- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- multer: File uploads
- music-metadata: Audio file metadata extraction
- sharp: Image processing
- cors: Cross-origin resource sharing
- helmet: Security headers
- morgan: HTTP request logging