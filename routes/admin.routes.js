import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import authMiddleware from '../middleware/authenticate.js';
import adminMiddleware from '../middleware/admin.js';
import handleValidate from '../middleware/handleValidate.js';
import { param, query, body } from 'express-validator';

const router = express.Router();

// All admin routes require authentication AND admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// 📊 DASHBOARD
router.get('/dashboard', adminController.getDashboardStats);

// 👥 USER MANAGEMENT
router.get('/users', adminController.getAllUsers);
router.put(
  '/users/:id/role',
  [
    param('id').isMongoId().withMessage('Valid user ID is required'),
    body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  ],
  handleValidate,
  adminController.updateUserRole
);
router.put(
  '/users/:id/suspend',
  [
    param('id').isMongoId().withMessage('Valid user ID is required'),
    body('reason').trim().notEmpty().withMessage('Suspension reason is required'),
  ],
  handleValidate,
  adminController.suspendUser
);
router.delete(
  '/users/:id',
  [
    param('id').isMongoId().withMessage('Valid user ID is required'),
  ],
  handleValidate,
  adminController.deleteUser
);

// 📌 CONTENT MODERATION
router.get('/content/reported', adminController.getReportedContent);
router.delete(
  '/pins/:id',
  [
    param('id').isMongoId().withMessage('Valid pin ID is required'),
  ],
  handleValidate,
  adminController.deletePin
);
router.delete(
  '/boards/:id',
  [
    param('id').isMongoId().withMessage('Valid board ID is required'),
  ],
  handleValidate,
  adminController.deleteBoard
);

// 📈 ANALYTICS
router.get(
  '/analytics',
  [
    query('period').optional().isInt({ min: 1, max: 365 }).withMessage('Period must be between 1 and 365 days'),
  ],
  handleValidate,
  adminController.getAnalytics
);

export default router;
