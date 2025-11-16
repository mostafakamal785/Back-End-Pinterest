import { Router } from 'express';
import * as exploreController from '../controllers/explore.controller.js';

const router = Router();

// Get trending pins
router.get('/trending', exploreController.getTrending);

// Get random pins
router.get('/random', exploreController.getRandom);

export default router;
