import { query, param } from 'express-validator';

// Global search validation
export const searchValidation = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1 })
    .withMessage('Search query must not be empty')
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters'),

  query('type')
    .optional()
    .isIn(['pins', 'boards', 'users', 'all'])
    .withMessage('Search type must be pins, boards, users, or all')
    .default('all'),

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

// Explore content validation
export const exploreValidation = [
  query('category')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Category must not exceed 30 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .default(1),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Limit must be between 1 and 30')
    .default(15),
];

// Category-based exploration
export const categoryExploreValidation = [
  param('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 30 })
    .withMessage('Category must not exceed 30 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .default(1),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Limit must be between 1 and 30')
    .default(15),
];

// Trending content validation
export const trendingValidation = [
  query('timeframe')
    .optional()
    .isIn(['today', 'week', 'month', 'all'])
    .withMessage('Timeframe must be today, week, month, or all')
    .default('week'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
    .default(20),
];
