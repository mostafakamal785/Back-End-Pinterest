import express from 'express';
import * as notificationsController from '../controllers/notifications.controller.js';
import authMiddleware from '../middleware/authenticate.js';
import handleValidate from '../middleware/handleValidate.js';
import { param, query, body } from 'express-validator';

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

// 📌 NOTIFICATION CRUD ROUTES
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('unreadOnly').optional().isIn(['true', 'false']).withMessage('unreadOnly must be true or false'),
  ],
  handleValidate,
  notificationsController.getUserNotifications
);

router.put(
  '/read',
  [
    body('notificationIds')
      .optional()
      .isArray()
      .withMessage('notificationIds must be an array'),
    body('notificationIds.*')
      .optional()
      .isMongoId()
      .withMessage('Each notification ID must be valid'),
  ],
  handleValidate,
  notificationsController.markNotificationsAsRead
);

router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Valid notification ID is required'),
  ],
  handleValidate,
  notificationsController.deleteNotification
);

router.get(
  '/count',
  notificationsController.getNotificationCount
);

export default router;
