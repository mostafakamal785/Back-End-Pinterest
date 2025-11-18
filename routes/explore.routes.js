import express from 'express';
import  handleValidate  from '../middleware/handleValidate.js';
import {
  exploreValidation,
  searchValidation,
  categoryExploreValidation,
  trendingValidation,
} from '../validations/search.validations.js';
import * as exploreController from '../controllers/explore.controller.js';
// import { optionalAuthMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
// router.use(optionalAuthMiddleware);

// EXPLORE CONTENT
router.get('/', exploreValidation, handleValidate, exploreController.getExploreContent);
router.get('/search', searchValidation, handleValidate, exploreController.searchContent);

// PINS EXPLORE
router.get(
  '/pins/random',
  exploreValidation,
  handleValidate,
  exploreController.getRandomPins
);
router.get(
  '/pins/category/:category',
  categoryExploreValidation,
  handleValidate,
  exploreController.getPinsByCategory
);
router.get(
  '/pins/trending',
  trendingValidation,
  handleValidate,
  exploreController.getTrendingPins
);

// BOARDS EXPLORE
router.get(
  '/boards/popular',
  exploreValidation,
  handleValidate,
  exploreController.getPopularBoards
);
router.get(
  '/boards/category/:category',
  categoryExploreValidation,
  handleValidate,
  exploreController.getBoardsByCategory
);
router.get(
  '/boards/recent',
  exploreValidation,
  handleValidate,
  exploreController.getRecentBoards
);

// CATEGORIES
router.get('/categories', exploreController.getCategories);
router.get('/categories/stats', exploreController.getCategoriesStats);

export default router;
