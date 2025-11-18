import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(uploadsDir, 'images');
const videosDir = path.join(uploadsDir, 'videos');

[uploadsDir, imagesDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, imagesDir);
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, videosDir);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

// Upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Image processing middleware
export const processImage = async (req, res, next) => {
  if (!req.file || !req.file.mimetype.startsWith('image/')) {
    return next();
  }

  try {
    const inputPath = req.file.path;
    const outputPath = path.join(imagesDir, `processed_${req.file.filename}`);

    // Resize and optimize image
    await sharp(inputPath)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    // Create thumbnail
    const thumbnailPath = path.join(imagesDir, `thumb_${req.file.filename}`);
    await sharp(inputPath)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Update file info
    req.file.processedPath = outputPath;
    req.file.thumbnailPath = thumbnailPath;
    req.file.uri = `/uploads/images/processed_${req.file.filename}`;
    req.file.thumbnail = `/uploads/images/thumb_${req.file.filename}`;

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next(error);
  }
};

// Video processing middleware (basic - could be enhanced)
export const processVideo = async (req, res, next) => {
  if (!req.file || !req.file.mimetype.startsWith('video/')) {
    return next();
  }

  // For now, just set the URI
  req.file.uri = req.file.mimetype.startsWith('video/')
    ? `/uploads/videos/${req.file.filename}`
    : `/uploads/images/processed_${req.file.filename}`;

  next();
};

// Single file upload
export const uploadSingle = (fieldName) => [
  upload.single(fieldName),
  processImage,
  processVideo
];

// Multiple files upload
export const uploadMultiple = (fieldName, maxCount = 5) => [
  upload.array(fieldName, maxCount),
  processImage,
  processVideo
];

// Error handler for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

export default upload;
