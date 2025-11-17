import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

// Validate ObjectId
const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ID format');
  }
  return true;
};

// Create Board
export const createBoardValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Board name is required')
    .isLength({ min: 3 })
    .withMessage('Board name must be at least 3 characters')
    .isLength({ max: 50 })
    .withMessage('Board name must not exceed 50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),

  body('privacy')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Privacy must be either public or private')
    .default('public'),

  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array')
    .custom((keywords) => {
      if (keywords && keywords.length > 10) {
        throw new Error('Cannot add more than 10 keywords');
      }
      return true;
    }),

  body('keywords.*')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Keyword must not exceed 20 characters'),
];

// Update Board
export const updateBoardValidation = [
  param('id').custom(isValidObjectId).withMessage('Invalid board ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Board name must be at least 3 characters')
    .isLength({ max: 50 })
    .withMessage('Board name must not exceed 50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),

  body('privacy')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Privacy must be either public or private'),

  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array')
    .custom((keywords) => {
      if (keywords && keywords.length > 10) {
        throw new Error('Cannot add more than 10 keywords');
      }
      return true;
    }),

  body('keywords.*')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Keyword must not exceed 20 characters'),

  body('coverImage').optional().isURL().withMessage('Cover image must be a valid URL'),
];

// Board ID validation
export const boardIdValidation = [
  param('id').custom(isValidObjectId).withMessage('Invalid board ID'),
];

// Manage Board Pins
export const manageBoardPinValidation = [
  param('id').custom(isValidObjectId).withMessage('Invalid board ID'),

  param('pinId').custom(isValidObjectId).withMessage('Invalid pin ID'),
];

// Search User Boards
export const searchUserBoardsValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query must not be empty')
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .default(1),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
    .default(20),
];

// Filter Boards by Privacy
export const filterBoardsPrivacyValidation = [
  param('type')
    .isIn(['public', 'private', 'all'])
    .withMessage('Privacy type must be public, private, or all'),
];
