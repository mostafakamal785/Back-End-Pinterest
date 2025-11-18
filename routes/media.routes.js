import express from 'express';
import * as mediaController from '../controllers/media.controller.js';
import authMiddleware from '../middleware/authenticate.js';
import { uploadSingle, handleUploadError } from '../middleware/uploadMiddleWare.js';
import { param, query } from 'express-validator';
import handleValidate from '../middleware/handleValidate.js';

const router = express.Router();

// All media routes require authentication
router.use(authMiddleware);

// 📌 UPLOAD MEDIA
router.post(
  '/upload',
  uploadSingle('media'),
  handleUploadError,
  mediaController.uploadMedia
);

// 📌 GET MEDIA INFO
router.get(
  '/info/:filename',
  [
    param('filename').notEmpty().withMessage('Filename is required'),
  ],
  handleValidate,
  mediaController.getMediaInfo
);

// 📌 DELETE MEDIA
router.delete(
  '/:filename',
  [
    param('filename').notEmpty().withMessage('Filename is required'),
  ],
  handleValidate,
  mediaController.deleteMedia
);

// 📌 LIST MEDIA FILES
router.get(
  '/',
  [
    query('type').optional().isIn(['image', 'video']).withMessage('Type must be image or video'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  handleValidate,
  mediaController.listMediaFiles
);

export default router;
