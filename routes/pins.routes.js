import express from 'express';
import * as pinsController from '../controllers/pins.controller.js';
import authMiddleware from '../middleware/authenticate.js';
import handleValidate from '../middleware/handleValidate.js';
import { uploadSingle, handleUploadError } from '../middleware/uploadMiddleWare.js';
import { createPinValidation, updatePinValidation, pinIdValidation } from '../validations/pins.validations.js';
import { param, query } from 'express-validator';

const router = express.Router();

// 📌 PIN CRUD ROUTES
router.post('/', authMiddleware, uploadSingle('image'), handleUploadError, createPinValidation, handleValidate, pinsController.createPin);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('category').optional().trim().isLength({ max: 50 }).withMessage('Category too long'),
    query('user').optional().isMongoId().withMessage('Invalid user ID'),
    query('board').optional().isMongoId().withMessage('Invalid board ID'),
    query('sortBy').optional().isIn(['createdAt', 'title']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
  ],
  handleValidate,
  pinsController.getPins
);

router.get(
  '/user/:userId',
  [
    param('userId').isMongoId().withMessage('Invalid user ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
  handleValidate,
  pinsController.getUserPins
);

router.get('/:id', pinIdValidation, handleValidate, pinsController.getPin);

router.put('/:id', authMiddleware, updatePinValidation, handleValidate, pinsController.updatePin);

router.delete('/:id', authMiddleware, pinIdValidation, handleValidate, pinsController.deletePin);

// 📌 PIN INTERACTIONS (like/unlike moved to like.routes.js)
// router.post('/:id/like', authMiddleware, pinIdValidation, handleValidate, pinsController.likePin);
// router.post('/:id/unlike', authMiddleware, pinIdValidation, handleValidate, pinsController.unlikePin);
// router.get('/:id/likes', pinIdValidation, handleValidate, pinsController.getLikes);

export default router;
