import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ID format');
  }
  return true;
};

// Note: These are for your use when managing pins in boards
export const pinIdValidation = [param('id').custom(isValidObjectId).withMessage('Invalid pin ID')];

export const createPinValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Pin title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters')
    .isLength({ max: 100 })
    .withMessage('Title must not exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('board').custom(isValidObjectId).withMessage('Invalid board ID'),

  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array')
    .custom((keywords) => {
      if (keywords && keywords.length > 15) {
        throw new Error('Cannot add more than 15 keywords');
      }
      return true;
    }),

  body('keywords.*')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Keyword must not exceed 20 characters'),

  body('link').optional().isURL().withMessage('Link must be a valid URL'),
];

export const updatePinValidation = [
  param('id').custom(isValidObjectId).withMessage('Invalid pin ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters')
    .isLength({ max: 100 })
    .withMessage('Title must not exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('board').optional().custom(isValidObjectId).withMessage('Invalid board ID'),

  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array')
    .custom((keywords) => {
      if (keywords && keywords.length > 15) {
        throw new Error('Cannot add more than 15 keywords');
      }
      return true;
    }),

  body('keywords.*')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Keyword must not exceed 20 characters'),

  body('link').optional().isURL().withMessage('Link must be a valid URL'),
];
