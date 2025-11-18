import express from 'express';
import * as commentsController from '../controllers/comments.controller.js';
import authMiddleware from '../middleware/authenticate.js';
import handleValidate from '../middleware/handleValidate.js';
import { body, param } from 'express-validator';

const router = express.Router();

// All comment routes require authentication
router.use(authMiddleware);

// 📌 COMMENT CRUD ROUTES
router.post(
  '/',
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ min: 1, max: 500 })
      .withMessage('Comment must be 1-500 characters'),
    body('pinId')
      .isMongoId()
      .withMessage('Valid pin ID is required'),
    body('parentCommentId')
      .optional()
      .isMongoId()
      .withMessage('Valid parent comment ID required'),
  ],
  handleValidate,
  commentsController.createComment
);

router.get(
  '/pin/:pinId',
  [
    param('pinId').isMongoId().withMessage('Valid pin ID is required'),
  ],
  handleValidate,
  commentsController.getPinComments
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Valid comment ID is required'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ min: 1, max: 500 })
      .withMessage('Comment must be 1-500 characters'),
  ],
  handleValidate,
  commentsController.updateComment
);

router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Valid comment ID is required'),
  ],
  handleValidate,
  commentsController.deleteComment
);

// 📌 COMMENT INTERACTIONS
router.post(
  '/:id/like',
  [
    param('id').isMongoId().withMessage('Valid comment ID is required'),
  ],
  handleValidate,
  commentsController.toggleCommentLike
);

export default router;
