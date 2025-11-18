import { successResponse, errorResponse } from '../utils/response.util.js';
import path from 'path';
import fs from 'fs';

// 📌 UPLOAD MEDIA FILE
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const mediaData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uri: req.file.uri,
      thumbnail: req.file.thumbnail || null,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
    };

    return successResponse(res, {
      media: mediaData,
      message: 'File uploaded successfully'
    }, 'File uploaded successfully', 201);
  } catch (error) {
    console.error('Upload Media Error:', error);
    return errorResponse(res, 'Failed to upload file', 500);
  }
};

// 📌 DELETE MEDIA FILE
export const deleteMedia = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return errorResponse(res, 'Filename is required', 400);
    }

    // Determine file paths
    const imagesDir = path.join(process.cwd(), 'uploads', 'images');
    const videosDir = path.join(process.cwd(), 'uploads', 'videos');

    const possiblePaths = [
      path.join(imagesDir, filename),
      path.join(imagesDir, `processed_${filename}`),
      path.join(imagesDir, `thumb_${filename}`),
      path.join(videosDir, filename),
    ];

    let deleted = false;
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deleted = true;
      }
    }

    if (!deleted) {
      return errorResponse(res, 'File not found', 404);
    }

    return successResponse(res, null, 'File deleted successfully');
  } catch (error) {
    console.error('Delete Media Error:', error);
    return errorResponse(res, 'Failed to delete file', 500);
  }
};

// 📌 GET MEDIA INFO
export const getMediaInfo = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return errorResponse(res, 'Filename is required', 400);
    }

    const imagesDir = path.join(process.cwd(), 'uploads', 'images');
    const videosDir = path.join(process.cwd(), 'uploads', 'videos');

    let filePath = null;
    let fileType = null;

    // Check if file exists in images or videos directory
    const imagePath = path.join(imagesDir, filename);
    const videoPath = path.join(videosDir, filename);

    if (fs.existsSync(imagePath)) {
      filePath = imagePath;
      fileType = 'image';
    } else if (fs.existsSync(videoPath)) {
      filePath = videoPath;
      fileType = 'video';
    } else {
      return errorResponse(res, 'File not found', 404);
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();

    const mediaInfo = {
      filename,
      type: fileType,
      extension: ext,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      uri: `/${fileType === 'image' ? 'images' : 'videos'}/${filename}`,
    };

    return successResponse(res, { media: mediaInfo });
  } catch (error) {
    console.error('Get Media Info Error:', error);
    return errorResponse(res, 'Failed to get media info', 500);
  }
};

// 📌 LIST UPLOADED FILES (Admin only - could be restricted)
export const listMediaFiles = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    const imagesDir = path.join(process.cwd(), 'uploads', 'images');
    const videosDir = path.join(process.cwd(), 'uploads', 'videos');

    let files = [];
    let totalSize = 0;

    // Get image files
    if (!type || type === 'image') {
      if (fs.existsSync(imagesDir)) {
        const imageFiles = fs.readdirSync(imagesDir)
          .filter(file => !file.startsWith('.')) // Exclude hidden files
          .map(file => {
            const filePath = path.join(imagesDir, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
            return {
              filename: file,
              type: 'image',
              size: stats.size,
              uri: `/uploads/images/${file}`,
              createdAt: stats.birthtime,
            };
          });
        files.push(...imageFiles);
      }
    }

    // Get video files
    if (!type || type === 'video') {
      if (fs.existsSync(videosDir)) {
        const videoFiles = fs.readdirSync(videosDir)
          .filter(file => !file.startsWith('.'))
          .map(file => {
            const filePath = path.join(videosDir, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
            return {
              filename: file,
              type: 'video',
              size: stats.size,
              uri: `/uploads/videos/${file}`,
              createdAt: stats.birthtime,
            };
          });
        files.push(...videoFiles);
      }
    }

    // Sort by creation date (newest first)
    files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = files.slice(startIndex, endIndex);

    return successResponse(res, {
      files: paginatedFiles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(files.length / limit),
        total: files.length,
      },
      totalSize,
    });
  } catch (error) {
    console.error('List Media Files Error:', error);
    return errorResponse(res, 'Failed to list media files', 500);
  }
};
